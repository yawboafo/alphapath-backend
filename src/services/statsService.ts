import db from '../config/database';

export class StatsService {
  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    activeUsers: number;
    revenue: number;
  }> {
    // Get total users
    const { rows: userRows } = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM users'
    );

    // Get total courses
    const { rows: courseRows } = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM courses'
    );

    // Get total enrollments
    const { rows: enrollmentRows } = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM enrollments'
    );

    // Get active users (users with activity in last 30 days)
    const { rows: activeUserRows } = await db.query<{ count: string }>(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM user_progress 
       WHERE last_accessed_at > NOW() - INTERVAL '30 days'`
    );

    // Get total revenue from payments
    const { rows: revenueRows } = await db.query<{ sum: string | null }>(
      `SELECT SUM(amount) as sum 
       FROM payments 
       WHERE status = 'succeeded'`
    );

    return {
      totalUsers: parseInt(userRows[0].count, 10),
      totalCourses: parseInt(courseRows[0].count, 10),
      totalEnrollments: parseInt(enrollmentRows[0].count, 10),
      activeUsers: parseInt(activeUserRows[0].count, 10),
      revenue: parseFloat(revenueRows[0].sum || '0'),
    };
  }

  async getRecentEnrollments(limit: number): Promise<
    Array<{
      id: string;
      userName: string;
      courseName: string;
      enrolledAt: Date;
    }>
  > {
    const { rows } = await db.query(
      `SELECT e.id, u.full_name as "userName", c.title as "courseName", 
              e.enrolled_at as "enrolledAt"
       FROM enrollments e
       INNER JOIN users u ON e.user_id = u.id
       INNER JOIN courses c ON e.course_id = c.id
       ORDER BY e.enrolled_at DESC
       LIMIT $1`,
      [limit]
    );

    return rows;
  }

  async getTopCourses(limit: number): Promise<
    Array<{
      id: string;
      title: string;
      enrollmentCount: number;
      completionRate: number;
    }>
  > {
    const { rows } = await db.query(
      `SELECT c.id, c.title, 
              COUNT(DISTINCT e.id) as "enrollmentCount",
              COALESCE(
                ROUND(
                  (COUNT(DISTINCT CASE WHEN up.completed = true THEN up.user_id END)::numeric / 
                   NULLIF(COUNT(DISTINCT e.user_id), 0)) * 100, 
                  2
                ), 
                0
              ) as "completionRate"
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN lessons l ON c.id = l.course_id
       LEFT JOIN user_progress up ON l.id = up.lesson_id
       GROUP BY c.id, c.title
       ORDER BY "enrollmentCount" DESC
       LIMIT $1`,
      [limit]
    );

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      enrollmentCount: parseInt(row.enrollmentCount, 10),
      completionRate: parseFloat(row.completionRate),
    }));
  }
}

export default new StatsService();
