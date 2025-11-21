import db from '../config/database';
import logger from '../utils/logger';

const migrations = [
  {
    name: '001_create_users_table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        membership_tier VARCHAR(50) DEFAULT 'free' CHECK (membership_tier IN ('free', 'basic', 'premium')),
        stripe_customer_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_membership_tier ON users(membership_tier);
    `,
  },
  {
    name: '002_create_courses_table',
    sql: `
      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('alpha', 'tech', 'life', 'mentorship')),
        thumbnail_url TEXT,
        video_count INTEGER DEFAULT 0,
        instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
        price DECIMAL(10, 2) DEFAULT 0,
        is_published BOOLEAN DEFAULT false,
        rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
        students_count INTEGER DEFAULT 0,
        duration VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_courses_category ON courses(category);
      CREATE INDEX idx_courses_is_published ON courses(is_published);
      CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
    `,
  },
  {
    name: '003_create_lessons_table',
    sql: `
      CREATE TABLE IF NOT EXISTS lessons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        section_title VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        video_url TEXT,
        duration VARCHAR(50),
        order_index INTEGER NOT NULL,
        is_preview BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_lessons_course_id ON lessons(course_id);
      CREATE INDEX idx_lessons_order ON lessons(course_id, order_index);
    `,
  },
  {
    name: '004_create_user_progress_table',
    sql: `
      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT false,
        progress_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, lesson_id)
      );
      
      CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
      CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
    `,
  },
  {
    name: '005_create_purchases_table',
    sql: `
      CREATE TABLE IF NOT EXISTS purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        payment_method VARCHAR(50),
        payment_provider VARCHAR(50),
        stripe_payment_id VARCHAR(255),
        purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_purchases_user_id ON purchases(user_id);
      CREATE INDEX idx_purchases_course_id ON purchases(course_id);
      CREATE INDEX idx_purchases_purchased_at ON purchases(purchased_at);
    `,
  },
  {
    name: '006_create_subscriptions_table',
    sql: `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan VARCHAR(50) NOT NULL CHECK (plan IN ('basic', 'premium')),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
        stripe_subscription_id VARCHAR(255),
        starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
        auto_renew BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
      CREATE INDEX idx_subscriptions_status ON subscriptions(status);
    `,
  },
  {
    name: '007_create_community_posts_table',
    sql: `
      CREATE TABLE IF NOT EXISTS community_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL CHECK (category IN ('alpha', 'tech', 'life', 'general')),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
      CREATE INDEX idx_community_posts_category ON community_posts(category);
      CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
    `,
  },
  {
    name: '008_create_comments_table',
    sql: `
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_comments_post_id ON comments(post_id);
      CREATE INDEX idx_comments_user_id ON comments(user_id);
      CREATE INDEX idx_comments_created_at ON comments(created_at);
    `,
  },
  {
    name: '009_create_reviews_table',
    sql: `
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating DECIMAL(3, 2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(course_id, user_id)
      );
      
      CREATE INDEX idx_reviews_course_id ON reviews(course_id);
      CREATE INDEX idx_reviews_user_id ON reviews(user_id);
    `,
  },
  {
    name: '010_create_notifications_table',
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX idx_notifications_read ON notifications(read);
      CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
    `,
  },
  {
    name: '011_create_certifications_table',
    sql: `
      CREATE TABLE IF NOT EXISTS certifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        certificate_url TEXT NOT NULL,
        issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      );
      
      CREATE INDEX idx_certifications_user_id ON certifications(user_id);
      CREATE INDEX idx_certifications_course_id ON certifications(course_id);
    `,
  },
  {
    name: '012_create_post_likes_table',
    sql: `
      CREATE TABLE IF NOT EXISTS post_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, post_id)
      );
      
      CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
      CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
    `,
  },
  {
    name: '013_create_comment_likes_table',
    sql: `
      CREATE TABLE IF NOT EXISTS comment_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, comment_id)
      );
      
      CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
      CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
    `,
  },
  {
    name: '014_create_migrations_table',
    sql: `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
  },
];

export async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    // Create migrations table first
    await db.query(migrations[migrations.length - 1].sql);

    // Get already executed migrations
    const { rows: executedMigrations } = await db.query<{ name: string }>(
      'SELECT name FROM migrations ORDER BY id'
    );
    const executedNames = new Set(executedMigrations.map((m: { name: string }) => m.name));

    // Run pending migrations
    for (const migration of migrations.slice(0, -1)) {
      if (!executedNames.has(migration.name)) {
        logger.info(`Running migration: ${migration.name}`);
        await db.query(migration.sql);
        await db.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
        logger.info(`Migration completed: ${migration.name}`);
      } else {
        logger.info(`Migration already executed: ${migration.name}`);
      }
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migrations finished');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration error:', error);
      process.exit(1);
    });
}
