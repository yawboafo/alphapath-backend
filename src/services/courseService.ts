import db from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string | null;
  videoCount: number;
  instructorId: string | null;
  price: number;
  isPublished: boolean;
  rating: number;
  studentsCount: number;
  duration: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Lesson {
  id: string;
  courseId: string;
  sectionTitle: string | null;
  title: string;
  videoUrl: string | null;
  duration: string | null;
  orderIndex: number;
  isPreview: boolean;
  createdAt: Date;
}

export class CourseService {
  async getAllCourses(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Course[]> {
    let query = `
      SELECT id, title, description, category, thumbnail_url as "thumbnailUrl",
             video_count as "videoCount", instructor_id as "instructorId", price,
             is_published as "isPublished", rating, students_count as "studentsCount",
             duration, created_at as "createdAt", updated_at as "updatedAt"
      FROM courses
      WHERE is_published = true
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (filters?.category) {
      query += ` AND category = $${paramCount++}`;
      values.push(filters.category);
    }

    if (filters?.minPrice !== undefined) {
      query += ` AND price >= $${paramCount++}`;
      values.push(filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query += ` AND price <= $${paramCount++}`;
      values.push(filters.maxPrice);
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await db.query<Course>(query, values);
    return rows;
  }

  async getCourseById(courseId: string): Promise<Course> {
    const { rows } = await db.query<Course>(
      `SELECT id, title, description, category, thumbnail_url as "thumbnailUrl",
              video_count as "videoCount", instructor_id as "instructorId", price,
              is_published as "isPublished", rating, students_count as "studentsCount",
              duration, created_at as "createdAt", updated_at as "updatedAt"
       FROM courses
       WHERE id = $1`,
      [courseId]
    );

    if (rows.length === 0) {
      throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND');
    }

    return rows[0];
  }

  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    // Verify course exists
    await this.getCourseById(courseId);

    const { rows } = await db.query<Lesson>(
      `SELECT id, course_id as "courseId", section_title as "sectionTitle",
              title, video_url as "videoUrl", duration, order_index as "orderIndex",
              is_preview as "isPreview", created_at as "createdAt"
       FROM lessons
       WHERE course_id = $1
       ORDER BY order_index ASC`,
      [courseId]
    );

    return rows;
  }

  async getUserCourses(userId: string): Promise<Course[]> {
    const { rows } = await db.query<Course>(
      `SELECT DISTINCT c.id, c.title, c.description, c.category, 
              c.thumbnail_url as "thumbnailUrl", c.video_count as "videoCount",
              c.instructor_id as "instructorId", c.price, c.is_published as "isPublished",
              c.rating, c.students_count as "studentsCount", c.duration,
              c.created_at as "createdAt", c.updated_at as "updatedAt"
       FROM courses c
       INNER JOIN purchases p ON c.id = p.course_id
       WHERE p.user_id = $1
       ORDER BY p.purchased_at DESC`,
      [userId]
    );

    return rows;
  }

  async enrollInCourse(userId: string, courseId: string): Promise<void> {
    // Verify course exists
    const course = await this.getCourseById(courseId);

    // Check if already purchased
    const { rows: existingPurchases } = await db.query(
      'SELECT id FROM purchases WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (existingPurchases.length > 0) {
      throw new AppError('Already enrolled in this course', 409, 'ALREADY_ENROLLED');
    }

    // Create purchase record (in a real app, this would be done after payment)
    await db.query(
      `INSERT INTO purchases (user_id, course_id, amount, currency, payment_method)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, courseId, course.price, 'USD', 'free_enrollment']
    );

    // Update course students count
    await db.query(
      'UPDATE courses SET students_count = students_count + 1 WHERE id = $1',
      [courseId]
    );
  }

  async getCourseProgress(userId: string, courseId: string): Promise<any> {
    // Get all lessons for the course
    const lessons = await this.getCourseLessons(courseId);

    // Get user progress for these lessons
    const { rows: progressRows } = await db.query(
      `SELECT lesson_id as "lessonId", completed, progress_percentage as "progressPercentage",
              last_watched_at as "lastWatchedAt"
       FROM user_progress
       WHERE user_id = $1 AND lesson_id = ANY($2::uuid[])`,
      [userId, lessons.map((l) => l.id)]
    );

    const progressMap = new Map(progressRows.map((p: any) => [p.lessonId, p]));

    const totalLessons = lessons.length;
    const completedLessons = progressRows.filter((p: any) => p.completed).length;
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      courseId,
      totalLessons,
      completedLessons,
      overallProgress: Math.round(overallProgress),
      lessons: lessons.map((lesson) => ({
        ...lesson,
        progress: progressMap.get(lesson.id) || {
          completed: false,
          progressPercentage: 0,
          lastWatchedAt: null,
        },
      })),
    };
  }

  async updateLessonProgress(
    userId: string,
    lessonId: string,
    progressPercentage: number,
    completed?: boolean
  ): Promise<void> {
    const isCompleted = completed ?? progressPercentage >= 90;

    await db.query(
      `INSERT INTO user_progress (user_id, lesson_id, progress_percentage, completed, last_watched_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET progress_percentage = $3, completed = $4, last_watched_at = NOW(), updated_at = NOW()`,
      [userId, lessonId, progressPercentage, isCompleted]
    );
  }
}

export default new CourseService();
