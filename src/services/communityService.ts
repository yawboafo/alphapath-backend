import db from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface Post {
  id: string;
  userId: string;
  category: string;
  title: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likesCount: number;
  createdAt: Date;
}

export class CommunityService {
  async getPosts(category?: string): Promise<Post[]> {
    let query = `
      SELECT id, user_id as "userId", category, title, content,
             likes_count as "likesCount", comments_count as "commentsCount",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM community_posts
    `;

    const values: any[] = [];

    if (category) {
      query += ' WHERE category = $1';
      values.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await db.query<Post>(query, values);
    return rows;
  }

  async getPostById(postId: string): Promise<Post> {
    const { rows } = await db.query<Post>(
      `SELECT id, user_id as "userId", category, title, content,
              likes_count as "likesCount", comments_count as "commentsCount",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM community_posts
       WHERE id = $1`,
      [postId]
    );

    if (rows.length === 0) {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
    }

    return rows[0];
  }

  async createPost(userId: string, data: {
    category: string;
    title: string;
    content: string;
  }): Promise<Post> {
    const { category, title, content } = data;

    const { rows } = await db.query<Post>(
      `INSERT INTO community_posts (user_id, category, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id as "userId", category, title, content,
                 likes_count as "likesCount", comments_count as "commentsCount",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [userId, category, title, content]
    );

    return rows[0];
  }

  async togglePostLike(userId: string, postId: string): Promise<{ liked: boolean }> {
    // Check if already liked
    const { rows: existingLikes } = await db.query(
      'SELECT id FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (existingLikes.length > 0) {
      // Unlike
      await db.transaction(async (client) => {
        await client.query('DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2', [
          userId,
          postId,
        ]);
        await client.query(
          'UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = $1',
          [postId]
        );
      });

      return { liked: false };
    } else {
      // Like
      await db.transaction(async (client) => {
        await client.query('INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)', [
          userId,
          postId,
        ]);
        await client.query(
          'UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = $1',
          [postId]
        );
      });

      return { liked: true };
    }
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    const { rows } = await db.query<Comment>(
      `SELECT id, post_id as "postId", user_id as "userId", content,
              likes_count as "likesCount", created_at as "createdAt"
       FROM comments
       WHERE post_id = $1
       ORDER BY created_at ASC`,
      [postId]
    );

    return rows;
  }

  async createComment(userId: string, postId: string, content: string): Promise<Comment> {
    const comment = await db.transaction(async (client) => {
      const { rows } = await client.query<Comment>(
        `INSERT INTO comments (user_id, post_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, post_id as "postId", user_id as "userId", content,
                   likes_count as "likesCount", created_at as "createdAt"`,
        [userId, postId, content]
      );

      await client.query(
        'UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = $1',
        [postId]
      );

      return rows[0];
    });

    return comment;
  }
}

export default new CommunityService();
