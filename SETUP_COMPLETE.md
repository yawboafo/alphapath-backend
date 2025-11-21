# AlphaPath Backend - Setup Complete! ✅

## Backend Status
✅ **Server Running**: Port 5001  
✅ **Database**: PostgreSQL configured and populated  
✅ **API Endpoints**: All functional  
✅ **Test Data**: Created successfully

## Test Credentials

| Email | Password | Tier |
|-------|----------|------|
| admin@test.com | Admin123! | free |
| premium@test.com | Premium123! | free |
| elite@test.com | Elite123! | free |

## Database Contents

### Users
- **Count**: 3 users
- All users created with test credentials above

### Courses
- **Count**: 7 courses
- **Categories**:
  - Alpha (2 courses)
    - Alpha Mindset Mastery ($49.99, 8 hours)
    - Advanced Leadership Strategies ($99.99, 12 hours)
  - Tech (2 courses)
    - Web Development Bootcamp ($149.99, 40 hours)
    - Mobile App Development with React Native ($129.99, 30 hours)
  - Life (2 courses)
    - Financial Freedom Blueprint ($79.99, 15 hours)
    - Fitness & Nutrition Mastery ($89.99, 20 hours)
  - Mentorship (1 course)
    - 1-on-1 Business Coaching ($499.99, 10 hours)

### Lessons
- **Count**: 3 lessons (for Alpha Mindset Mastery)
  1. Introduction to Alpha Mindset (30 min, free preview)
  2. Building Unshakeable Confidence (45 min)
  3. Leadership in Daily Life (40 min)

### Community Posts
- **Count**: 7 posts
- Categories: general, tech, life, alpha

## API Endpoints Available

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
POST /api/auth/refresh - Refresh access token
GET /api/auth/me - Get current user (requires auth)
```

### Courses
```
GET /api/courses - Get all published courses
GET /api/courses/:id - Get course details
GET /api/courses/:id/lessons - Get course lessons (requires auth)
POST /api/courses/:id/enroll - Enroll in course (requires auth)
GET /api/courses/my-courses - Get user's courses (requires auth)
GET /api/courses/:id/progress - Get course progress (requires auth)
POST /api/courses/lessons/:id/progress - Update lesson progress (requires auth)
```

### Community
```
GET /api/community/posts - Get all community posts
GET /api/community/posts/:id - Get post details
POST /api/community/posts - Create post (requires auth)
PUT /api/community/posts/:id - Update post (requires auth)
DELETE /api/community/posts/:id - Delete post (requires auth)
POST /api/community/posts/:id/like - Like post (requires auth)
POST /api/community/posts/:id/comments - Add comment (requires auth)
GET /api/community/posts/:id/comments - Get post comments
```

### Subscriptions
```
GET /api/subscriptions/plans - Get subscription plans
POST /api/subscriptions - Create subscription (requires auth)
GET /api/subscriptions/my-subscription - Get user's subscription (requires auth)
POST /api/subscriptions/cancel - Cancel subscription (requires auth)
```

### Payments
```
POST /api/payments/create-payment-intent - Create payment intent (requires auth)
POST /api/payments/webhook - Stripe webhook
```

### Reviews
```
POST /api/reviews - Create course review (requires auth)
GET /api/reviews/course/:courseId - Get course reviews
```

### Notifications
```
GET /api/notifications - Get user notifications (requires auth)
POST /api/notifications/:id/read - Mark notification as read (requires auth)
```

## Test Commands

### Test Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'
```

### Get All Courses
```bash
curl http://localhost:5001/api/courses
```

### Get Community Posts
```bash
curl http://localhost:5001/api/community/posts
```

## Next Steps - Frontend Development

Now that the backend is fully operational, you can proceed with:

1. **Initialize React Admin Dashboard**
   - Create Vite + React + TypeScript project
   - Install dependencies (TailwindCSS, shadcn/ui, React Query, etc.)

2. **Build Authentication UI**
   - Login page
   - Token management
   - Protected routes

3. **Dashboard Components**
   - Course management (CRUD)
   - User management
   - Community moderation
   - Analytics/metrics

4. **API Integration**
   - Use the endpoints listed above
   - Base URL: `http://localhost:5001/api`
   - Include Authorization header for protected routes

## Server Management

### Start Server
```bash
cd /Users/nykb/Downloads/alphapath_backend
npm run dev
```

### Stop Server
Press `Ctrl+C` in the terminal running the server

### Check Server Status
```bash
lsof -i:5001
```

## Notes
- Backend runs on port 5001 (port 5000 was already in use)
- PostgreSQL database: `alphapath`
- All API responses follow format: `{ success: boolean, data: any, message?: string }`
- Rate limiting is enabled on auth endpoints
- JWT tokens expire in 15 minutes (access) and 7 days (refresh)
