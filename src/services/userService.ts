import db from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  membershipTier: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  async getAllUsers(filters: {
    page: number;
    limit: number;
    search: string;
    role: string;
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page, limit, search, role } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, email, full_name as "fullName", avatar_url as "avatarUrl",
             membership_tier as "membershipTier", created_at as "createdAt",
             updated_at as "updatedAt"
      FROM users
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      query += ` AND membership_tier = $${paramCount}`;
      values.push(role);
      paramCount++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1${
      search ? ` AND (full_name ILIKE $1 OR email ILIKE $1)` : ''
    }${role ? ` AND membership_tier = $${search ? 2 : 1}` : ''}`;

    const countValues = [];
    if (search) countValues.push(`%${search}%`);
    if (role) countValues.push(role);

    const { rows: countRows } = await db.query<{ total: string }>(countQuery, countValues);
    const total = parseInt(countRows[0].total, 10);

    // Get paginated users
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const { rows } = await db.query<User>(query, values);

    return {
      users: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(userId: string): Promise<{
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    membershipTier: string;
    enrolledCourses: number;
    completedCourses: number;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const { rows } = await db.query(
      `SELECT u.id, u.email, u.full_name as "fullName", u.avatar_url as "avatarUrl",
              u.membership_tier as "membershipTier", u.created_at as "createdAt",
              u.updated_at as "updatedAt",
              COUNT(DISTINCT e.id) as "enrolledCourses",
              COUNT(DISTINCT CASE WHEN up.completed = true THEN up.lesson_id END) as completed_lessons
       FROM users u
       LEFT JOIN enrollments e ON u.id = e.user_id
       LEFT JOIN user_progress up ON u.id = up.user_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );

    if (rows.length === 0) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Calculate completed courses (courses where all lessons are completed)
    const { rows: completedRows } = await db.query<{ count: string }>(
      `SELECT COUNT(DISTINCT c.id) as count
       FROM courses c
       INNER JOIN lessons l ON c.id = l.course_id
       INNER JOIN user_progress up ON l.id = up.lesson_id
       WHERE up.user_id = $1 AND up.completed = true
       GROUP BY c.id
       HAVING COUNT(l.id) = COUNT(up.lesson_id)`,
      [userId]
    );

    const user = rows[0];
    return {
      ...user,
      enrolledCourses: parseInt(user.enrolledCourses as any, 10) || 0,
      completedCourses: parseInt(completedRows[0]?.count || '0', 10),
    };
  }

  async updateUser(
    userId: string,
    updateData: {
      fullName?: string;
      avatarUrl?: string;
      membershipTier?: string;
    }
  ): Promise<User> {
    // Verify user exists
    await this.getUserById(userId);

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updateData.fullName !== undefined) {
      fields.push(`full_name = $${paramCount++}`);
      values.push(updateData.fullName);
    }
    if (updateData.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${paramCount++}`);
      values.push(updateData.avatarUrl);
    }
    if (updateData.membershipTier !== undefined) {
      fields.push(`membership_tier = $${paramCount++}`);
      values.push(updateData.membershipTier);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const { rows } = await db.query<User>(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, email, full_name as "fullName", avatar_url as "avatarUrl",
                 membership_tier as "membershipTier", created_at as "createdAt",
                 updated_at as "updatedAt"`,
      values
    );

    return rows[0];
  }

  async deleteUser(userId: string): Promise<void> {
    // Verify user exists
    await this.getUserById(userId);

    // Delete user and related data (cascading handled by database constraints or manual cleanup)
    await db.query('DELETE FROM user_progress WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM enrollments WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM community_posts WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM community_comments WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
  }

  async getUserStats(userId: string): Promise<{
    totalCourses: number;
    completedCourses: number;
    overallProgress: number;
    totalLearningTime: string;
  }> {
    // Get enrolled courses count
    const { rows: enrolledRows } = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM enrollments WHERE user_id = $1',
      [userId]
    );

    // Get completed courses count (courses where all lessons are completed)
    const { rows: completedRows } = await db.query<{ count: string }>(
      `SELECT COUNT(DISTINCT c.id) as count
       FROM courses c
       INNER JOIN lessons l ON c.id = l.course_id
       INNER JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = $1
       WHERE e.user_id = $1
       GROUP BY c.id
       HAVING COUNT(CASE WHEN up.completed = true THEN 1 END) = COUNT(l.id)`,
      [userId]
    );

    // Calculate overall progress
    const { rows: progressRows } = await db.query<{ avg: string }>(
      `SELECT AVG(progress_percentage) as avg
       FROM user_progress
       WHERE user_id = $1`,
      [userId]
    );

    const totalCourses = parseInt(enrolledRows[0].count, 10);
    const completedCourses = completedRows.length;
    const overallProgress = parseFloat(progressRows[0]?.avg || '0');

    return {
      totalCourses,
      completedCourses,
      overallProgress: Math.round(overallProgress * 10) / 10,
      totalLearningTime: '0 hours', // TODO: Implement time tracking
    };
  }
}

export default new UserService();
