# AlphaPath Academy API Documentation

**Base URL:** `https://alphapath-api.onrender.com`

## Table of Contents
- [Authentication](#authentication)
- [Users Management](#users-management)
- [Dashboard Statistics](#dashboard-statistics)
- [Courses](#courses)
- [Course Sections](#course-sections)
- [Reviews](#reviews)
- [Community](#community)
- [Payments](#payments)
- [Health Check](#health-check)

---

## Authentication

### Register User
**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatarUrl": null,
      "membershipTier": "free",
      "createdAt": "2025-11-21T18:30:40.463Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}
```

---

### Login
**POST** `/api/auth/login`

Authenticate a user and get tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatarUrl": null,
      "membershipTier": "free",
      "createdAt": "2025-11-21T18:30:40.463Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

---

### Refresh Token
**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Current User Profile
**GET** `/api/auth/profile`

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatarUrl": null,
      "membershipTier": "free",
      "createdAt": "2025-11-21T18:30:40.463Z"
    }
  }
}
```

---

## Users Management

### Get All Users (Admin Only)
**GET** `/api/users`

Get paginated list of all users with optional search and filtering.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string, optional) - Search by name or email
- `role` (string, optional) - Filter by membership tier

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "John Doe",
        "avatarUrl": null,
        "membershipTier": "free",
        "createdAt": "2025-11-21T18:30:40.463Z",
        "updatedAt": "2025-11-21T18:30:40.463Z"
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 5
  }
}
```

---

### Get User by ID (Admin Only)
**GET** `/api/users/:id`

Get detailed information about a specific user.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatarUrl": null,
    "membershipTier": "free",
    "enrolledCourses": 5,
    "completedCourses": 2,
    "createdAt": "2025-11-21T18:30:40.463Z",
    "updatedAt": "2025-11-21T18:30:40.463Z"
  }
}
```

---

### Update User (Admin Only)
**PUT** `/api/users/:id`

Update user information.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "fullName": "Jane Doe",
  "avatarUrl": "https://example.com/avatar.jpg",
  "membershipTier": "premium"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "membershipTier": "premium",
    "createdAt": "2025-11-21T18:30:40.463Z",
    "updatedAt": "2025-11-21T19:45:20.123Z"
  }
}
```

---

### Delete User (Admin Only)
**DELETE** `/api/users/:id`

Delete a user account and all associated data.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Get User Statistics
**GET** `/api/users/stats`

Get statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalCourses": 5,
    "completedCourses": 2,
    "overallProgress": 45.5,
    "totalLearningTime": "0 hours"
  }
}
```

---

## Dashboard Statistics

### Get Dashboard Overview (Admin Only)
**GET** `/api/stats/dashboard`

Get overview statistics for admin dashboard.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalCourses": 25,
    "totalEnrollments": 450,
    "activeUsers": 75,
    "revenue": 12500.50
  }
}
```

---

### Get Recent Enrollments (Admin Only)
**GET** `/api/stats/recent-enrollments`

Get recent course enrollments.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `limit` (number, default: 10) - Number of enrollments to return

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userName": "John Doe",
      "courseName": "Introduction to Alpha",
      "enrolledAt": "2025-11-21T18:30:40.463Z"
    }
  ]
}
```

---

### Get Top Courses (Admin Only)
**GET** `/api/stats/top-courses`

Get top performing courses by enrollment count.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `limit` (number, default: 5) - Number of courses to return

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Introduction to Alpha",
      "enrollmentCount": 125,
      "completionRate": 68.5
    }
  ]
}
```

---

## Courses

### Get All Courses
**GET** `/api/courses`

Retrieve all published courses with optional filters.

**Query Parameters:**
- `category` (optional): Filter by category (`alpha`, `tech`, `life`, `mentorship`)
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price

**Example:**
```
GET /api/courses?category=tech&maxPrice=100
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "title": "Introduction to Web Development",
        "description": "Learn the basics of web development",
        "category": "tech",
        "thumbnailUrl": "https://example.com/image.jpg",
        "videoCount": 12,
        "instructorId": "uuid",
        "price": 99.99,
        "isPublished": true,
        "rating": 4.5,
        "studentsCount": 150,
        "duration": "10 hours",
        "createdAt": "2025-11-21T18:00:00.000Z",
        "updatedAt": "2025-11-21T18:00:00.000Z"
      }
    ]
  }
}
```

---

### Get Course by ID
**GET** `/api/courses/:id`

Get details of a specific course.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "uuid",
      "title": "Introduction to Web Development",
      "description": "Learn the basics of web development",
      "category": "tech",
      "thumbnailUrl": "https://example.com/image.jpg",
      "videoCount": 12,
      "instructorId": "uuid",
      "price": 99.99,
      "isPublished": true,
      "rating": 4.5,
      "studentsCount": 150,
      "duration": "10 hours",
      "createdAt": "2025-11-21T18:00:00.000Z",
      "updatedAt": "2025-11-21T18:00:00.000Z"
    }
  }
}
```

---

### Create Course
**POST** `/api/courses`

Create a new course (requires authentication).

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Introduction to Python",
  "description": "Learn Python from scratch",
  "category": "tech",
  "thumbnailUrl": "https://example.com/python.jpg",
  "price": 79.99,
  "duration": "8 hours",
  "isPublished": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "uuid",
      "title": "Introduction to Python",
      "description": "Learn Python from scratch",
      "category": "tech",
      "thumbnailUrl": "https://example.com/python.jpg",
      "videoCount": 0,
      "instructorId": "uuid",
      "price": 79.99,
      "isPublished": false,
      "rating": 0,
      "studentsCount": 0,
      "duration": "8 hours",
      "createdAt": "2025-11-21T18:00:00.000Z",
      "updatedAt": "2025-11-21T18:00:00.000Z"
    }
  },
  "message": "Course created successfully"
}
```

---

### Update Course
**PUT** `/api/courses/:id`

Update an existing course (requires authentication, instructor only).

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "title": "Advanced Python Programming",
  "description": "Master Python",
  "price": 149.99,
  "isPublished": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "uuid",
      "title": "Advanced Python Programming",
      "description": "Master Python",
      "category": "tech",
      "thumbnailUrl": "https://example.com/python.jpg",
      "videoCount": 0,
      "instructorId": "uuid",
      "price": 149.99,
      "isPublished": true,
      "rating": 0,
      "studentsCount": 0,
      "duration": "8 hours",
      "createdAt": "2025-11-21T18:00:00.000Z",
      "updatedAt": "2025-11-21T19:00:00.000Z"
    }
  },
  "message": "Course updated successfully"
}
```

---

### Delete Course
**DELETE** `/api/courses/:id`

Delete a course (requires authentication, instructor only).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

---

### Get Course Lessons
**GET** `/api/courses/:id/lessons`

Get all lessons for a specific course (requires authentication).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "lessons": [
      {
        "id": "uuid",
        "courseId": "uuid",
        "sectionTitle": "Getting Started",
        "title": "Introduction to the Course",
        "videoUrl": "https://example.com/video1.mp4",
        "duration": "10:30",
        "orderIndex": 1,
        "isPreview": true,
        "createdAt": "2025-11-21T18:00:00.000Z"
      }
    ]
  }
}
```

---

### Enroll in Course
**POST** `/api/courses/:id/enroll`

Enroll the authenticated user in a course.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Enrolled in course successfully"
}
```

---

### Get My Courses
**GET** `/api/courses/my-courses`

Get all courses the authenticated user is enrolled in.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "title": "Introduction to Web Development",
        "description": "Learn the basics",
        "category": "tech",
        "thumbnailUrl": "https://example.com/image.jpg",
        "videoCount": 12,
        "instructorId": "uuid",
        "price": 99.99,
        "isPublished": true,
        "rating": 4.5,
        "studentsCount": 150,
        "duration": "10 hours",
        "enrolledAt": "2025-11-21T18:30:00.000Z"
      }
    ]
  }
}
```

---

### Get Course Progress
**GET** `/api/courses/:id/progress`

Get the authenticated user's progress for a specific course.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "progress": {
      "courseId": "uuid",
      "overallProgress": 45.5,
      "completedLessons": 5,
      "totalLessons": 11,
      "lessons": [
        {
          "id": "uuid",
          "title": "Introduction",
          "orderIndex": 1,
          "progress": {
            "progressPercentage": 100,
            "completed": true,
            "lastWatchedAt": "2025-11-21T18:30:00.000Z"
          }
        }
      ]
    }
  }
}
```

---

### Update Lesson Progress
**POST** `/api/courses/lessons/:id/progress`

Update progress for a specific lesson.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "progressPercentage": 75,
  "completed": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Progress updated successfully"
}
```

---

## Course Sections

### Get Course Sections
**GET** `/api/courses/:courseId/sections`

Get all sections for a course.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "courseId": "uuid",
      "title": "Getting Started",
      "orderIndex": 1,
      "createdAt": "2025-11-21T18:30:40.463Z",
      "updatedAt": "2025-11-21T18:30:40.463Z"
    }
  ]
}
```

---

### Create Course Section
**POST** `/api/courses/:courseId/sections`

Create a new section (instructor only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Advanced Topics",
  "orderIndex": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Section created successfully",
  "data": {
    "id": "uuid",
    "courseId": "uuid",
    "title": "Advanced Topics",
    "orderIndex": 2,
    "createdAt": "2025-11-21T18:30:40.463Z",
    "updatedAt": "2025-11-21T18:30:40.463Z"
  }
}
```

---

### Update Course Section
**PUT** `/api/sections/:sectionId`

Update a section (instructor only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Updated Section Title",
  "orderIndex": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Section updated successfully",
  "data": {
    "id": "uuid",
    "courseId": "uuid",
    "title": "Updated Section Title",
    "orderIndex": 3,
    "createdAt": "2025-11-21T18:30:40.463Z",
    "updatedAt": "2025-11-21T19:45:20.123Z"
  }
}
```

---

### Delete Course Section
**DELETE** `/api/sections/:sectionId`

Delete a section (instructor only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Section deleted successfully"
}
```

---

## Reviews

### Get Course Reviews
**GET** `/api/courses/:courseId/reviews`

Get all reviews for a course with pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "courseId": "uuid",
      "userId": "uuid",
      "userName": "John Doe",
      "userAvatar": "https://example.com/avatar.jpg",
      "rating": 4.5,
      "comment": "Great course! Highly recommend.",
      "createdAt": "2025-11-21T18:30:40.463Z",
      "updatedAt": "2025-11-21T18:30:40.463Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### Get Review Statistics
**GET** `/api/courses/:courseId/reviews/stats`

Get review statistics for a course.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.3,
    "totalReviews": 25,
    "ratingDistribution": {
      "5": 12,
      "4": 8,
      "3": 3,
      "2": 1,
      "1": 1
    }
  }
}
```

---

### Create Review
**POST** `/api/courses/:courseId/reviews`

Create a review for a course (must be enrolled).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "rating": 4.5,
  "comment": "Great course! Highly recommend."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": "uuid",
    "courseId": "uuid",
    "userId": "uuid",
    "userName": "John Doe",
    "userAvatar": "https://example.com/avatar.jpg",
    "rating": 4.5,
    "comment": "Great course! Highly recommend.",
    "createdAt": "2025-11-21T18:30:40.463Z",
    "updatedAt": "2025-11-21T18:30:40.463Z"
  }
}
```

---

### Update Review
**PUT** `/api/courses/reviews/:reviewId`

Update your own review.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "rating": 5.0,
  "comment": "Updated review comment."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": "uuid",
    "courseId": "uuid",
    "userId": "uuid",
    "userName": "John Doe",
    "userAvatar": "https://example.com/avatar.jpg",
    "rating": 5.0,
    "comment": "Updated review comment.",
    "createdAt": "2025-11-21T18:30:40.463Z",
    "updatedAt": "2025-11-21T19:45:20.123Z"
  }
}
```

---

### Delete Review
**DELETE** `/api/courses/reviews/:reviewId`

Delete your own review.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Community

### Get All Posts
**GET** `/api/community/posts`

Get all community posts with pagination.

**Query Parameters:**
- `limit` (optional, default: 20): Number of posts per page
- `offset` (optional, default: 0): Offset for pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "userId": "uuid",
        "userName": "John Doe",
        "userAvatar": null,
        "content": "Just completed my first project!",
        "imageUrl": "https://example.com/image.jpg",
        "likesCount": 15,
        "commentsCount": 3,
        "createdAt": "2025-11-21T18:00:00.000Z",
        "updatedAt": "2025-11-21T18:00:00.000Z"
      }
    ]
  }
}
```

---

### Get Post by ID
**GET** `/api/community/posts/:id`

Get a specific community post with comments.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "userId": "uuid",
      "userName": "John Doe",
      "userAvatar": null,
      "content": "Just completed my first project!",
      "imageUrl": "https://example.com/image.jpg",
      "likesCount": 15,
      "commentsCount": 3,
      "createdAt": "2025-11-21T18:00:00.000Z",
      "comments": [
        {
          "id": "uuid",
          "userId": "uuid",
          "userName": "Jane Smith",
          "content": "Great work!",
          "createdAt": "2025-11-21T18:05:00.000Z"
        }
      ]
    }
  }
}
```

---

### Create Post
**POST** `/api/community/posts`

Create a new community post (requires authentication).

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Just completed my first project!",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "userId": "uuid",
      "content": "Just completed my first project!",
      "imageUrl": "https://example.com/image.jpg",
      "createdAt": "2025-11-21T18:00:00.000Z"
    }
  },
  "message": "Post created successfully"
}
```

---

### Like/Unlike Post
**POST** `/api/community/posts/:id/like`

Toggle like on a post (requires authentication).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Post liked successfully"
}
```
or
```json
{
  "success": true,
  "message": "Post unliked successfully"
}
```

---

### Add Comment
**POST** `/api/community/posts/:id/comments`

Add a comment to a post (requires authentication).

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Great work!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "uuid",
      "postId": "uuid",
      "userId": "uuid",
      "content": "Great work!",
      "createdAt": "2025-11-21T18:05:00.000Z"
    }
  },
  "message": "Comment added successfully"
}
```

---

## Payments

### Create Payment Intent
**POST** `/api/payments/create-intent`

Create a Stripe payment intent (requires authentication).

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "uuid",
  "amount": 9999
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx"
  }
}
```

---

### Webhook Handler
**POST** `/api/payments/webhook`

Handle Stripe webhook events (used by Stripe, not for direct calls).

---

## Health Check

### Health Check
**GET** `/health`

Check if the API is running.

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-21T18:30:21.249Z"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to perform this action"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- All authenticated endpoints require the `Authorization: Bearer <token>` header
- The API uses rate limiting (disabled for testing currently)
- Free tier services sleep after 15 minutes of inactivity (first request takes 30-60 seconds)

---

## Categories

Valid course categories:
- `alpha` - Alpha mindset and personal development
- `tech` - Technical and engineering courses
- `life` - Life skills and general knowledge
- `mentorship` - Mentorship programs

## Membership Tiers

Valid membership tiers:
- `free` - Free tier (default)
- `basic` - Basic paid membership
- `premium` - Premium paid membership
