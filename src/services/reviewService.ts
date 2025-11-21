import db from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ReviewService {
  async getCourseReviews(
    courseId: string,
    page: number,
    limit: number
  ): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    // Get total count
    const { rows: countRows } = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM reviews WHERE course_id = $1',
      [courseId]
    );
    const total = parseInt(countRows[0].count, 10);

    // Get reviews with user info
    const { rows } = await db.query<Review>(
      `SELECT r.id, r.course_id as "courseId", r.user_id as "userId",
              u.full_name as "userName", u.avatar_url as "userAvatar",
              r.rating, r.comment, r.created_at as "createdAt",
              r.updated_at as "updatedAt"
       FROM reviews r
       INNER JOIN users u ON r.user_id = u.id
       WHERE r.course_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [courseId, limit, offset]
    );

    return {
      reviews: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createReview(
    courseId: string,
    userId: string,
    data: { rating: number; comment?: string }
  ): Promise<Review> {
    // Check if user is enrolled in the course
    const { rows: enrollmentRows } = await db.query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (enrollmentRows.length === 0) {
      throw new AppError(
        'You must be enrolled in this course to leave a review',
        403,
        'NOT_ENROLLED'
      );
    }

    // Check if user already reviewed this course
    const { rows: existingReview } = await db.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (existingReview.length > 0) {
      throw new AppError(
        'You have already reviewed this course',
        400,
        'REVIEW_EXISTS'
      );
    }

    // Create review
    const { rows } = await db.query(
      `INSERT INTO reviews (course_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, course_id as "courseId", user_id as "userId",
                 rating, comment, created_at as "createdAt",
                 updated_at as "updatedAt"`,
      [courseId, userId, data.rating, data.comment || null]
    );

    // Update course rating
    await this.updateCourseRating(courseId);

    // Get user info for response
    const { rows: userRows } = await db.query(
      'SELECT full_name as "userName", avatar_url as "userAvatar" FROM users WHERE id = $1',
      [userId]
    );

    return {
      ...rows[0],
      userName: userRows[0].userName,
      userAvatar: userRows[0].userAvatar,
    };
  }

  async updateReview(
    reviewId: string,
    userId: string,
    data: { rating?: number; comment?: string }
  ): Promise<Review> {
    // Verify review exists and belongs to user
    const { rows: reviewRows } = await db.query(
      'SELECT course_id, user_id FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewRows.length === 0) {
      throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    if (reviewRows[0].user_id !== userId) {
      throw new AppError(
        'You can only update your own reviews',
        403,
        'FORBIDDEN'
      );
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.rating !== undefined) {
      fields.push(`rating = $${paramCount++}`);
      values.push(data.rating);
    }
    if (data.comment !== undefined) {
      fields.push(`comment = $${paramCount++}`);
      values.push(data.comment);
    }

    fields.push(`updated_at = NOW()`);
    values.push(reviewId);

    const { rows } = await db.query(
      `UPDATE reviews
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, course_id as "courseId", user_id as "userId",
                 rating, comment, created_at as "createdAt",
                 updated_at as "updatedAt"`,
      values
    );

    // Update course rating if rating changed
    if (data.rating !== undefined) {
      await this.updateCourseRating(reviewRows[0].course_id);
    }

    // Get user info for response
    const { rows: userRows } = await db.query(
      'SELECT full_name as "userName", avatar_url as "userAvatar" FROM users WHERE id = $1',
      [userId]
    );

    return {
      ...rows[0],
      userName: userRows[0].userName,
      userAvatar: userRows[0].userAvatar,
    };
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    // Verify review exists and belongs to user
    const { rows: reviewRows } = await db.query(
      'SELECT course_id, user_id FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewRows.length === 0) {
      throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    if (reviewRows[0].user_id !== userId) {
      throw new AppError(
        'You can only delete your own reviews',
        403,
        'FORBIDDEN'
      );
    }

    await db.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

    // Update course rating
    await this.updateCourseRating(reviewRows[0].course_id);
  }

  async getReviewStats(courseId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    // Get average rating and total count
    const { rows: statsRows } = await db.query<{
      avg: string | null;
      count: string;
    }>(
      `SELECT AVG(rating) as avg, COUNT(*) as count
       FROM reviews
       WHERE course_id = $1`,
      [courseId]
    );

    // Get rating distribution
    const { rows: distRows } = await db.query<{ rating: number; count: string }>(
      `SELECT rating, COUNT(*) as count
       FROM reviews
       WHERE course_id = $1
       GROUP BY rating
       ORDER BY rating DESC`,
      [courseId]
    );

    const ratingDistribution: { [key: number]: number } = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    distRows.forEach((row) => {
      ratingDistribution[Math.round(row.rating)] = parseInt(row.count, 10);
    });

    return {
      averageRating: parseFloat(statsRows[0].avg || '0'),
      totalReviews: parseInt(statsRows[0].count, 10),
      ratingDistribution,
    };
  }

  private async updateCourseRating(courseId: string): Promise<void> {
    const { rows } = await db.query<{ avg: string | null }>(
      'SELECT AVG(rating) as avg FROM reviews WHERE course_id = $1',
      [courseId]
    );

    const avgRating = parseFloat(rows[0].avg || '0');

    await db.query('UPDATE courses SET rating = $1 WHERE id = $2', [
      avgRating,
      courseId,
    ]);
  }
}

export default new ReviewService();
