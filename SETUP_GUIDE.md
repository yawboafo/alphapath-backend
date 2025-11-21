# AlphaPath Academy Backend - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 15+ installed and running
- npm or yarn package manager

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd /Users/nykb/Downloads/alphapath_backend
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your database credentials:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/alphapath_db
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=alphapath_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   JWT_SECRET=your_super_secret_key_min_32_chars_long
   JWT_REFRESH_SECRET=another_secret_key_min_32_chars_long
   ```

3. **Create PostgreSQL Database**
   ```bash
   # Option 1: Using psql
   psql -U postgres
   CREATE DATABASE alphapath_db;
   \q
   
   # Option 2: Using createdb command
   createdb alphapath_db
   ```

4. **Run Database Migrations**
   ```bash
   npm run migrate
   ```
   
   This will create all 13 tables:
   - users
   - courses
   - lessons
   - user_progress
   - purchases
   - subscriptions
   - community_posts
   - comments
   - reviews
   - notifications
   - certifications
   - post_likes
   - comment_likes

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Server will start on `http://localhost:5000`

6. **Test the API**
   ```bash
   curl http://localhost:5000/health
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "2024-11-21T..."
   }
   ```

## 📡 API Endpoints

### Authentication Endpoints
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user (Protected)
PUT    /api/auth/me            - Update profile (Protected)
POST   /api/auth/logout        - Logout (Protected)
```

### Course Endpoints
```
GET    /api/courses            - List all courses
GET    /api/courses/:id        - Get course details
GET    /api/courses/:id/lessons - Get course lessons (Protected)
POST   /api/courses/:id/enroll - Enroll in course (Protected)
GET    /api/courses/my-courses - Get user's courses (Protected)
GET    /api/courses/:id/progress - Get course progress (Protected)
POST   /api/courses/lessons/:id/progress - Update lesson progress (Protected)
```

### Community Endpoints
```
GET    /api/community/posts           - List all posts
GET    /api/community/posts/:id       - Get post details
POST   /api/community/posts           - Create post (Protected)
POST   /api/community/posts/:id/like  - Like/unlike post (Protected)
GET    /api/community/posts/:id/comments - Get post comments
POST   /api/community/posts/:id/comments - Add comment (Protected)
```

## 🧪 Testing the API

### 1. Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "fullName": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

Save the `accessToken` from the response.

### 3. Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. List Courses
```bash
curl -X GET http://localhost:5000/api/courses
```

## 📊 Database Schema

### Users Table
- Stores user accounts and profiles
- Fields: id, email, password_hash, full_name, avatar_url, membership_tier
- Membership tiers: free, basic, premium

### Courses Table
- Stores course information
- Fields: id, title, description, category, price, rating, students_count
- Categories: alpha, tech, life, mentorship

### Lessons Table
- Stores individual lessons for each course
- Fields: id, course_id, title, video_url, duration, order_index

### User Progress Table
- Tracks user learning progress
- Fields: id, user_id, lesson_id, completed, progress_percentage

### Community Posts Table
- Stores community discussions
- Fields: id, user_id, category, title, content, likes_count, comments_count

## 🔐 Security Features

✅ Password hashing with bcrypt (10 rounds)
✅ JWT authentication (15min access + 7day refresh tokens)
✅ Rate limiting (100 requests per 15 minutes)
✅ Input validation with Joi
✅ SQL injection protection (parameterized queries)
✅ CORS configuration
✅ Helmet security headers

## 📝 Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run migrate

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## 🌐 Production Deployment

### Option 1: Railway (Recommended for MVP)
1. Sign up at railway.app
2. Create new project
3. Add PostgreSQL service
4. Deploy from GitHub repo
5. Set environment variables in Railway dashboard

### Option 2: Render
1. Sign up at render.com
2. Create new Web Service
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

### Option 3: AWS
1. Set up EC2 instance
2. Install Node.js and PostgreSQL
3. Configure security groups
4. Deploy application
5. Set up Nginx reverse proxy

## 🔄 Next Steps

### Phase 1: Payment Integration (Week 3-4)
- [ ] Integrate Stripe for international payments
- [ ] Integrate Paystack for Ghana mobile money
- [ ] Create payment endpoints
- [ ] Handle webhooks for payment confirmation
- [ ] Update subscription logic

### Phase 2: File Upload & Storage (Week 4)
- [ ] Set up AWS S3 or Cloudflare R2
- [ ] Create upload endpoints (images, videos, documents)
- [ ] Generate signed URLs for secure access
- [ ] Integrate video CDN (Cloudflare Stream)

### Phase 3: Push Notifications (Week 5)
- [ ] Set up Firebase Cloud Messaging
- [ ] Create notification system
- [ ] Send notifications for:
  - New course enrollment
  - Lesson completion
  - Community interactions
  - Payment confirmations

### Phase 4: Admin Panel APIs (Week 5)
- [ ] Create course management endpoints
- [ ] Add lesson management endpoints
- [ ] Build analytics dashboard
- [ ] User management tools

### Phase 5: Testing & Optimization (Week 6)
- [ ] Write unit tests (80% coverage)
- [ ] Write integration tests
- [ ] Load testing (100+ concurrent users)
- [ ] Security audit
- [ ] Performance optimization

## 📞 Support

For issues or questions:
- Email: support@alphapath.com
- GitHub Issues: Create an issue in the repository

## 📄 License

MIT License - See LICENSE file for details

---

**Status**: ✅ Core backend implementation complete
**Last Updated**: November 2024
