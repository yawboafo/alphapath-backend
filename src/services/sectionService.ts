import db from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface Section {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SectionService {
  async getCourseSections(courseId: string): Promise<Section[]> {
    const { rows } = await db.query<Section>(
      `SELECT id, course_id as "courseId", title, order_index as "orderIndex",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM course_sections
       WHERE course_id = $1
       ORDER BY order_index ASC`,
      [courseId]
    );

    return rows;
  }

  async createSection(
    courseId: string,
    data: { title: string; orderIndex: number; instructorId: string }
  ): Promise<Section> {
    // Verify course exists and user is instructor
    const { rows: courseRows } = await db.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseRows.length === 0) {
      throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND');
    }

    if (courseRows[0].instructor_id !== data.instructorId) {
      throw new AppError(
        'Only the course instructor can create sections',
        403,
        'FORBIDDEN'
      );
    }

    const { rows } = await db.query<Section>(
      `INSERT INTO course_sections (course_id, title, order_index)
       VALUES ($1, $2, $3)
       RETURNING id, course_id as "courseId", title, order_index as "orderIndex",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [courseId, data.title, data.orderIndex]
    );

    return rows[0];
  }

  async updateSection(
    sectionId: string,
    instructorId: string,
    data: { title?: string; orderIndex?: number }
  ): Promise<Section> {
    // Verify section exists and user is instructor
    const { rows: sectionRows } = await db.query(
      `SELECT cs.id, c.instructor_id
       FROM course_sections cs
       INNER JOIN courses c ON cs.course_id = c.id
       WHERE cs.id = $1`,
      [sectionId]
    );

    if (sectionRows.length === 0) {
      throw new AppError('Section not found', 404, 'SECTION_NOT_FOUND');
    }

    if (sectionRows[0].instructor_id !== instructorId) {
      throw new AppError(
        'Only the course instructor can update sections',
        403,
        'FORBIDDEN'
      );
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.orderIndex !== undefined) {
      fields.push(`order_index = $${paramCount++}`);
      values.push(data.orderIndex);
    }

    fields.push(`updated_at = NOW()`);
    values.push(sectionId);

    const { rows } = await db.query<Section>(
      `UPDATE course_sections
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, course_id as "courseId", title, order_index as "orderIndex",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );

    return rows[0];
  }

  async deleteSection(sectionId: string, instructorId: string): Promise<void> {
    // Verify section exists and user is instructor
    const { rows: sectionRows } = await db.query(
      `SELECT cs.id, c.instructor_id
       FROM course_sections cs
       INNER JOIN courses c ON cs.course_id = c.id
       WHERE cs.id = $1`,
      [sectionId]
    );

    if (sectionRows.length === 0) {
      throw new AppError('Section not found', 404, 'SECTION_NOT_FOUND');
    }

    if (sectionRows[0].instructor_id !== instructorId) {
      throw new AppError(
        'Only the course instructor can delete sections',
        403,
        'FORBIDDEN'
      );
    }

    // Set section_id to NULL for lessons in this section
    await db.query('UPDATE lessons SET section_id = NULL WHERE section_id = $1', [
      sectionId,
    ]);

    // Delete the section
    await db.query('DELETE FROM course_sections WHERE id = $1', [sectionId]);
  }
}

export default new SectionService();
