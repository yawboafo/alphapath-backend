-- Insert courses directly into database
INSERT INTO courses (title, description, category, thumbnail_url, price, duration, is_published, created_at) VALUES
('Alpha Mindset Mastery', 'Develop the mindset of a true alpha. Learn confidence, resilience, and leadership.', 'alpha', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', 49.99, '8 hours', true, NOW()),
('Advanced Leadership Strategies', 'Master advanced leadership techniques for personal and professional success.', 'alpha', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7', 99.99, '12 hours', true, NOW()),
('Web Development Bootcamp', 'Complete web development course: HTML, CSS, JavaScript, React, Node.js', 'tech', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97', 149.99, '40 hours', true, NOW()),
('Mobile App Development with React Native', 'Build cross-platform mobile apps with React Native and TypeScript', 'tech', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c', 129.99, '30 hours', true, NOW()),
('Financial Freedom Blueprint', 'Learn investment strategies, budgeting, and wealth building principles', 'life', 'https://images.unsplash.com/photo-1579621970795-87facc2f976d', 79.99, '15 hours', true, NOW()),
('Fitness & Nutrition Mastery', 'Complete guide to building muscle, losing fat, and optimizing health', 'life', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b', 89.99, '20 hours', true, NOW()),
('1-on-1 Business Coaching', 'Personal mentorship for entrepreneurs and business professionals', 'mentorship', 'https://images.unsplash.com/photo-1552664730-d307ca884978', 499.99, '10 hours', true, NOW());

-- Insert lessons for the first course (Alpha Mindset Mastery)
INSERT INTO lessons (course_id, title, video_url, duration, order_index, is_preview)
SELECT 
    id,
    'Introduction to Alpha Mindset',
    'https://www.youtube.com/watch?v=example1',
    '30 minutes',
    1,
    true
FROM courses WHERE title = 'Alpha Mindset Mastery';

INSERT INTO lessons (course_id, title, video_url, duration, order_index, is_preview)
SELECT 
    id,
    'Building Unshakeable Confidence',
    'https://www.youtube.com/watch?v=example2',
    '45 minutes',
    2,
    false
FROM courses WHERE title = 'Alpha Mindset Mastery';

INSERT INTO lessons (course_id, title, video_url, duration, order_index, is_preview)
SELECT 
    id,
    'Leadership in Daily Life',
    'https://www.youtube.com/watch?v=example3',
    '40 minutes',
    3,
    false
FROM courses WHERE title = 'Alpha Mindset Mastery';
