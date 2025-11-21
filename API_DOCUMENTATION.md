# AlphaPath Academy API Documentation

## Base URL
```
Development: http://localhost:5000
Production: https://api.alphapath.com
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Access tokens expire after 15 minutes. Refresh tokens expire after 7 days.

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123",
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
      "createdAt": "2024-11-21T..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}
```

**Validation:**
- Email must be valid
- Password minimum 8 characters, must contain uppercase, lowercase, and number
- Full name minimum 2 characters

---

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  },
  "message": "Login successful"
}
```

---

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
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
      "avatarUrl": "https://...",
      "membershipTier": "premium",
      "createdAt": "2024-11-21T..."
    }
  }
}
```

---

### Update Profile
```http
PUT /api/auth/me
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "fullName": "John Smith",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  },
  "message": "Profile updated successfully"
}
```

---

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Course Endpoints

### List All Courses
```http
GET /api/courses?category=tech&minPrice=0&maxPrice=100
```

**Query Parameters:**
- `category` (optional): Filter by category (alpha, tech, life, mentorship)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "title": "JavaScript Mastery",
        "description": "Complete JavaScript course...",
        "category": "tech",
        "thumbnailUrl": "https://...",
        "videoCount": 50,
        "instructorId": "uuid",
        "price": 49.99,
        "isPublished": true,
        "rating": 4.8,
        "studentsCount": 1234,
        "duration": "15 hours",
        "createdAt": "2024-11-21T...",
        "updatedAt": "2024-11-21T..."
      }
    ]
  }
}
```

---

### Get Course Details
```http
GET /api/courses/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "course": { ... }
  }
}
```

---

### Get Course Lessons
```http
GET /api/courses/:id/lessons
Authorization: Bearer {token}
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
        "sectionTitle": "Introduction",
        "title": "Getting Started",
        "videoUrl": "https://...",
        "duration": "10:30",
        "orderIndex": 1,
        "isPreview": true,
        "createdAt": "2024-11-21T..."
      }
    ]
  }
}
```

---

### Enroll in Course
```http
POST /api/courses/:id/enroll
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully enrolled in course"
}
```

**Note:** In production, this would create a payment intent first.

---

### Get User's Courses
```http
GET /api/courses/my-courses
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courses": [ ... ]
  }
}
```

---

### Get Course Progress
```http
GET /api/courses/:id/progress
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "progress": {
      "courseId": "uuid",
      "totalLessons": 50,
      "completedLessons": 15,
      "overallProgress": 30,
      "lessons": [
        {
          "id": "uuid",
          "title": "Getting Started",
          "progress": {
            "completed": true,
            "progressPercentage": 100,
            "lastWatchedAt": "2024-11-21T..."
          }
        }
      ]
    }
  }
}
```

---

### Update Lesson Progress
```http
POST /api/courses/lessons/:id/progress
Authorization: Bearer {token}
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

**Note:** Lesson is auto-marked as completed when progressPercentage >= 90%

---

## Community Endpoints

### List Community Posts
```http
GET /api/community/posts?category=tech
```

**Query Parameters:**
- `category` (optional): Filter by category (alpha, tech, life, general)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "userId": "uuid",
        "category": "tech",
        "title": "How to stay motivated?",
        "content": "I've been struggling with...",
        "likesCount": 15,
        "commentsCount": 8,
        "createdAt": "2024-11-21T...",
        "updatedAt": "2024-11-21T..."
      }
    ]
  }
}
```

---

### Get Post Details
```http
GET /api/community/posts/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "post": { ... }
  }
}
```

---

### Create Post
```http
POST /api/community/posts
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "category": "tech",
  "title": "My learning journey",
  "content": "Today I learned about..."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "post": { ... }
  },
  "message": "Post created successfully"
}
```

---

### Like/Unlike Post
```http
POST /api/community/posts/:id/like
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "liked": true
  },
  "message": "Post liked"
}
```

---

### Get Post Comments
```http
GET /api/community/posts/:id/comments
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "uuid",
        "postId": "uuid",
        "userId": "uuid",
        "content": "Great post!",
        "likesCount": 3,
        "createdAt": "2024-11-21T..."
      }
    ]
  }
}
```

---

### Add Comment
```http
POST /api/community/posts/:id/comments
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "content": "This is very helpful, thanks!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "comment": { ... }
  },
  "message": "Comment added successfully"
}
```

---

## Payment Endpoints

### Create Stripe Payment Intent
Create a payment intent for Stripe payments.

**Endpoint**: `POST /api/payments/stripe/create-intent`

**Authentication**: Required

**Request Body**:
```json
{
  "amount": 49.99,
  "currency": "usd",
  "courseId": "uuid-of-course",
  "metadata": {
    "courseName": "Alpha Mindset Mastery"
  }
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 4999,
    "currency": "usd"
  }
}
```

---

### Initialize Paystack Payment
Initialize a payment for Paystack (Ghana Mobile Money, Cards, Bank Transfer).

**Endpoint**: `POST /api/payments/paystack/initialize`

**Authentication**: Required

**Request Body**:
```json
{
  "amount": 200.00,
  "courseId": "uuid-of-course",
  "metadata": {
    "courseName": "Tech Career Growth"
  }
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/xxx",
    "accessCode": "xxx",
    "reference": "ref_xxx"
  }
}
```

---

### Verify Paystack Payment
Verify a Paystack payment using the reference.

**Endpoint**: `GET /api/payments/paystack/verify/:reference`

**Authentication**: Required

**URL Parameters**:
- `reference` (string) - Paystack payment reference

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "status": "success",
    "reference": "ref_xxx",
    "amount": 200.00,
    "currency": "GHS",
    "email": "user@example.com",
    "metadata": { ... }
  }
}
```

---

### Create Subscription
Create a new subscription for a user.

**Endpoint**: `POST /api/payments/subscriptions`

**Authentication**: Required

**Request Body**:
```json
{
  "planId": "uuid-of-plan",
  "tier": "premium",
  "paymentMethod": "stripe"
}
```

**Validation Rules**:
- `planId`: Required, valid UUID
- `tier`: Required, one of: "free", "basic", "premium", "lifetime"
- `paymentMethod`: Required, one of: "stripe", "paystack"

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "planId": "uuid",
    "tier": "premium",
    "startDate": "2024-11-21T10:00:00Z",
    "endDate": "2024-12-21T10:00:00Z",
    "status": "active",
    "paymentMethod": "stripe"
  },
  "message": "Subscription created successfully"
}
```

---

### Cancel Subscription
Cancel an active subscription.

**Endpoint**: `DELETE /api/payments/subscriptions/:id`

**Authentication**: Required

**URL Parameters**:
- `id` (string) - Subscription ID

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "endDate": "2024-11-21T10:00:00Z"
  },
  "message": "Subscription cancelled successfully"
}
```

---

### Get User Subscriptions
Get all subscriptions for the authenticated user.

**Endpoint**: `GET /api/payments/subscriptions`

**Authentication**: Required

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "tier": "premium",
      "startDate": "2024-11-21T10:00:00Z",
      "endDate": "2024-12-21T10:00:00Z",
      "status": "active",
      "paymentMethod": "stripe"
    }
  ]
}
```

---

### Get Purchase History
Get all course purchases for the authenticated user.

**Endpoint**: `GET /api/payments/purchases`

**Authentication**: Required

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "courseId": "uuid",
      "courseTitle": "Alpha Mindset Mastery",
      "thumbnailUrl": "https://...",
      "amount": 49.99,
      "paymentMethod": "stripe",
      "transactionId": "pi_xxx",
      "status": "completed",
      "createdAt": "2024-11-21T10:00:00Z"
    }
  ]
}
```

---

### Stripe Webhook
Webhook endpoint for Stripe payment events.

**Endpoint**: `POST /api/payments/stripe/webhook`

**Authentication**: Not required (signature verified)

**Headers**:
- `stripe-signature`: Stripe webhook signature

**Events Handled**:
- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `customer.subscription.deleted` - Subscription cancelled

---

### Paystack Webhook
Webhook endpoint for Paystack payment events.

**Endpoint**: `POST /api/payments/paystack/webhook`

**Authentication**: Not required (signature verified)

**Headers**:
- `x-paystack-signature`: Paystack webhook signature

**Events Handled**:
- `charge.success` - Payment completed successfully
- `subscription.disable` - Subscription disabled

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INVALID_PASSWORD` | 400 | Password doesn't meet requirements |
| `UNAUTHORIZED` | 401 | Authentication required |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `INVALID_TOKEN` | 401 | JWT token is invalid |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `COURSE_NOT_FOUND` | 404 | Course doesn't exist |
| `POST_NOT_FOUND` | 404 | Community post doesn't exist |
| `NOT_FOUND` | 404 | Route not found |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `ALREADY_ENROLLED` | 409 | Already enrolled in course |
| `ALREADY_PURCHASED` | 400 | Course already purchased |
| `PAYMENT_FAILED` | 400 | Payment processing failed |
| `INVALID_SIGNATURE` | 400 | Invalid webhook signature |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes

Exceeded requests will receive:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests from this IP, please try again later."
  }
}
```

---

## Postman Collection

Import this collection to test the API in Postman:
[Download Postman Collection](./postman_collection.json)

---

**Last Updated**: November 2024
