# Open Path — Backend

REST API backend for the Open Path learning platform. Built with Express.js and Prisma ORM on PostgreSQL.

## Tech Stack

- **Runtime:** Node.js (CommonJS)
- **Framework:** Express v5
- **ORM:** Prisma with `@prisma/adapter-pg`
- **Database:** PostgreSQL
- **Auth:** JWT (access + refresh tokens) with bcryptjs
- **Validation:** Joi
- **File Storage:** S3-compatible (via `multer-s3`)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Package Manager:** Bun

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/)
- S3-compatible storage (for image uploads)
- Firebase project (for push notifications)

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

add your credentials

### Firebase Setup

Place your Firebase service account key file at `src/utils/serviceAccountKey.json`. You can download this from the Firebase Console under **Project Settings → Service accounts → Generate new private key**.

### Database Setup

```bash
# Run migrations
bunx prisma migrate deploy --config prisma.config.ts

# Generate Prisma client
bunx prisma generate --config prisma.config.ts
```

### Run

```bash
# Development (with auto-reload)
bun run dev

# Production
bun run start
```

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The access token expires in **1 hour**. Use the `/api/auth/refresh` endpoint to get a new one (the refresh token is stored as an HTTP-only cookie and expires in **7 days**).

---

## API Reference

### Auth — `/api/auth`

---

#### `POST /api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "P@ssw0rd!",
  "role": "user"
}
```

| Field      | Type   | Required | Description                            |
| ---------- | ------ | -------- | -------------------------------------- |
| `name`     | string | Yes      | User's full name                       |
| `email`    | string | Yes      | Must be unique                         |
| `password` | string | Yes      | Plain-text password (hashed on server) |
| `role`     | string | No       | `"user"` (default) or `"admin"`        |

**Response `201`:**

```json
{
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

A `refreshToken` cookie is also set automatically.

**Error `400`:**

```json
{
  "message": "User with this email already exists."
}
```

---

#### `POST /api/auth/login`

Login with existing credentials.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "P@ssw0rd!"
}
```

| Field      | Type   | Required | Description |
| ---------- | ------ | -------- | ----------- |
| `email`    | string | Yes      | User email  |
| `password` | string | Yes      | Password    |

**Response `200`:**

```json
{
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

A `refreshToken` cookie is also set automatically.

**Error `401`:**

```json
{
  "message": "Invalid email or password"
}
```

---

#### `POST /api/auth/refresh`

Refresh the access token using the refresh token cookie.

**Request Body:** None

**Cookies Required:** `refreshToken` (set automatically by login/register)

**Response `200`:**

```json
{
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error `401`:**

```json
{
  "message": "Refresh token not provided"
}
```

```json
{
  "message": "Invalid refresh token"
}
```

---

#### `POST /api/auth/logout`

Logout and clear the refresh token cookie. **Requires authentication.**

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Response `200`:**

```json
{
  "message": "Logged out successfully"
}
```

**Error `401`:**

```json
{
  "message": "Authorization header missing or invalid"
}
```

---

### User — `/api/user`

> All user endpoints require authentication.

---

#### `GET /api/user/profile`

Get the authenticated user's profile with enrollments.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response `200`:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "fcmToken": null,
  "createdAt": "2026-07-21T04:00:00.000Z",
  "updatedAt": "2026-07-21T04:00:00.000Z",
  "enrollments": [
    {
      "id": 1,
      "userId": 1,
      "courseId": 1,
      "createdAt": "2026-07-21T04:00:00.000Z",
      "updatedAt": "2026-07-21T04:00:00.000Z",
      "course": {
        "id": 1,
        "title": "Introduction to JavaScript",
        "description": "Learn JS from scratch",
        "imageUrl": null,
        "price": 0,
        "published": false,
        "createdAt": "2026-07-21T04:00:00.000Z",
        "updatedAt": "2026-07-21T04:00:00.000Z"
      }
    }
  ]
}
```

**Error `404`:**

```json
{
  "message": "User not found"
}
```

---

#### `PUT /api/user/profile`

Update the authenticated user's profile.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

| Field   | Type   | Required | Description      |
| ------- | ------ | -------- | ---------------- |
| `name`  | string | No       | User's full name |
| `email` | string | No       | User email       |

**Response `200`:**

```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "USER",
  "fcmToken": null,
  "createdAt": "2026-07-21T04:00:00.000Z",
  "updatedAt": "2026-07-21T05:00:00.000Z"
}
```

---

#### `DELETE /api/user/profile`

Delete the authenticated user's account.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Response `200`:**

```json
{
  "message": "User profile deleted successfully"
}
```

---

#### `PUT /api/user/fcm-token`

Store or update the user's FCM push notification token.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "fcmToken": "eJ7xk9..."
}
```

| Field      | Type   | Required | Description                    |
| ---------- | ------ | -------- | ------------------------------ |
| `fcmToken` | string | Yes      | Firebase Cloud Messaging token |

**Response `200`:**

```json
{
  "message": "FCM token updated successfully"
}
```

**Error `400`:**

```json
{
  "message": "FCM token is required"
}
```

---

### Courses — `/api/courses`

> All course endpoints require authentication.

---

#### `GET /api/courses`

Get all courses with their lessons and enrollments.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response `200`:**

```json
{
  "message": "Courses fetched successfully",
  "data": [
    {
      "id": 1,
      "title": "Introduction to JavaScript",
      "description": "Learn JS from scratch",
      "imageUrl": "https://example.com/js.png",
      "price": 29.99,
      "published": true,
      "createdAt": "2026-07-21T04:00:00.000Z",
      "updatedAt": "2026-07-21T04:00:00.000Z",
      "lessons": [
        {
          "id": 1,
          "title": "Variables and Types",
          "content": "In this lesson...",
          "videoId": "https://example.com/video1.mp4",
          "courseId": 1,
          "sequence": 1,
          "createdAt": "2026-07-21T04:00:00.000Z",
          "updatedAt": "2026-07-21T04:00:00.000Z"
        }
      ],
      "enrollments": [
        {
          "id": 1,
          "userId": 1,
          "courseId": 1,
          "createdAt": "2026-07-21T04:00:00.000Z",
          "updatedAt": "2026-07-21T04:00:00.000Z",
          "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "USER",
            "createdAt": "2026-07-21T04:00:00.000Z",
            "updatedAt": "2026-07-21T04:00:00.000Z"
          }
        }
      ],
      "isEnrolled": true
    }
  ]
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

#### `GET /api/courses/:id`

Get a single course by ID.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Course ID   |

**Response `200`:**

```json
{
  "message": "Course fetched successfully",
  "data": {
    "id": 1,
    "title": "Introduction to JavaScript",
    "description": "Learn JS from scratch",
    "imageUrl": "https://example.com/js.png",
    "price": 29.99,
    "published": true,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z",
    "lessons": [],
    "enrollments": [],
    "isEnrolled": false
  }
}
```

**Error `404`:**

```json
{
  "error": "Course not found"
}
```

---

#### `POST /api/courses/:courseId/enroll`

Enroll the authenticated user in a course.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param      | Type   | Description |
| ---------- | ------ | ----------- |
| `courseId` | number | Course ID   |

**Request Body:** None

**Response `200`:**

```json
{
  "message": "Enrolled in course successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "courseId": 1,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z"
  }
}
```

**Error `400`:**

```json
{
  "error": "User is already enrolled in this course"
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

#### `GET /api/courses/enrollments`

Get all enrollments for the authenticated user.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response `200`:**

```json
{
  "message": "Enrollments fetched successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "courseId": 1,
      "createdAt": "2026-07-21T04:00:00.000Z",
      "updatedAt": "2026-07-21T04:00:00.000Z",
      "course": {
        "id": 1,
        "title": "Introduction to JavaScript",
        "description": "Learn JS from scratch",
        "imageUrl": "https://example.com/js.png",
        "price": 29.99,
        "published": true,
        "createdAt": "2026-07-21T04:00:00.000Z",
        "updatedAt": "2026-07-21T04:00:00.000Z",
        "lessons": []
      }
    }
  ]
}
```

---

### Lessons — `/api/lessons`

> All lesson endpoints require authentication.

---

#### `GET /api/lessons/course/:courseId`

Get all lessons for a specific course.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param      | Type   | Description |
| ---------- | ------ | ----------- |
| `courseId` | number | Course ID   |

**Response `200`:**

```json
{
  "message": "Lessons fetched successfully",
  "data": [
    {
      "id": 1,
      "title": "Variables and Types",
      "content": "In this lesson...",
      "videoId": "https://example.com/video1.mp4",
      "courseId": 1,
      "sequence": 1,
      "createdAt": "2026-07-21T04:00:00.000Z",
      "updatedAt": "2026-07-21T04:00:00.000Z",
      "course": {
        "id": 1,
        "title": "Introduction to JavaScript",
        "description": "Learn JS from scratch",
        "imageUrl": null,
        "price": 0,
        "published": false,
        "createdAt": "2026-07-21T04:00:00.000Z",
        "updatedAt": "2026-07-21T04:00:00.000Z"
      },
      "progress": [],
      "isCompleted": false
    }
  ]
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

#### `GET /api/lessons/:id`

Get a single lesson by ID.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Lesson ID   |

**Response `200`:**

```json
{
  "message": "Lesson fetched successfully",
  "data": {
    "id": 1,
    "title": "Variables and Types",
    "content": "In this lesson...",
    "videoId": "https://example.com/video1.mp4",
    "courseId": 1,
    "sequence": 1,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z",
    "course": {
      "id": 1,
      "title": "Introduction to JavaScript"
    },
    "progress": [],
    "isCompleted": false
  }
}
```

**Error `404`:**

```json
{
  "error": "Lesson not found"
}
```

---

#### `POST /api/lessons/:lessonId/complete`

Mark a lesson as completed for the authenticated user. A `LessonProgress` record must already exist (see the progress tracking flow below).

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param      | Type   | Description |
| ---------- | ------ | ----------- |
| `lessonId` | number | Lesson ID   |

**Request Body:** None

**Response `200`:**

```json
{
  "message": "Lesson completed successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "lessonId": 1,
    "completed": true,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T05:00:00.000Z"
  }
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

#### `PUT /api/lessons/:lessonTrackId`

Update a lesson progress record.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param           | Type   | Description       |
| --------------- | ------ | ----------------- |
| `lessonTrackId` | number | LessonProgress ID |

**Request Body:**

```json
{
  "completed": true
}
```

| Field       | Type    | Required | Description       |
| ----------- | ------- | -------- | ----------------- |
| `completed` | boolean | No       | Completion status |

**Response `200`:**

```json
{
  "message": "Lesson track updated successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "lessonId": 1,
    "completed": true,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T05:00:00.000Z"
  }
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

### Quizzes — `/api/quizzes`

> All quiz endpoints require authentication.

---

#### `GET /api/quizzes/course/:courseId`

Fetch the quiz for a specific course, including questions and answers.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param      | Type   | Description |
| ---------- | ------ | ----------- |
| `courseId` | number | Course ID   |

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "title": "JavaScript Basics Quiz",
    "courseId": 1,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z",
    "questions": [
      {
        "id": 1,
        "question": "What is JavaScript?",
        "quizId": 1,
        "sequence": 1,
        "createdAt": "2026-07-21T04:00:00.000Z",
        "updatedAt": "2026-07-21T04:00:00.000Z",
        "answers": [
          {
            "id": 1,
            "answer": "A programming language",
            "correct": true,
            "questionId": 1,
            "createdAt": "2026-07-21T04:00:00.000Z",
            "updatedAt": "2026-07-21T04:00:00.000Z"
          }
        ]
      }
    ]
  }
}
```

**Error `404`:**

```json
{
  "error": "Quiz not found for this course"
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

#### `POST /api/quizzes/submit/:quizId`

Submit a quiz attempt. Responses are graded and saved. A score of 70% or above is required to pass.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param    | Type   | Description |
| -------- | ------ | ----------- |
| `quizId` | number | Quiz ID     |

**Request Body:**

```json
{
  "responses": [
    {
      "questionId": 1,
      "answerId": 1
    }
  ]
}
```

| Field                    | Type   | Required | Description                   |
| ------------------------ | ------ | -------- | ----------------------------- |
| `responses`              | array  | Yes      | List of quiz response objects |
| `responses[].questionId` | number | Yes      | The question being answered   |
| `responses[].answerId`   | number | Yes      | The selected answer option ID |

**Response `201`:**

```json
{
  "message": "Quiz graded successfully",
  "data": {
    "attemptId": 1,
    "score": 100.0,
    "passed": true,
    "correctCount": 1,
    "totalQuestions": 1
  }
}
```

**Error `404`:**

```json
{
  "error": "Quiz not found"
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

### Admin — `/api/admin`

> All admin endpoints require authentication **and** the `admin` role.

---

#### `GET /api/admin/users`

Get all users with their enrollments.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response `200`:**

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "fcmToken": null,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z",
    "enrollments": [
      {
        "id": 1,
        "userId": 1,
        "courseId": 1,
        "createdAt": "2026-07-21T04:00:00.000Z",
        "updatedAt": "2026-07-21T04:00:00.000Z",
        "course": {
          "id": 1,
          "title": "Introduction to JavaScript",
          "description": "Learn JS from scratch",
          "imageUrl": null,
          "price": 0,
          "published": false,
          "createdAt": "2026-07-21T04:00:00.000Z",
          "updatedAt": "2026-07-21T04:00:00.000Z"
        }
      }
    ]
  }
]
```

**Error `500`:**

```json
{
  "message": "Internal server error"
}
```

---

#### `GET /api/admin/courses`

Get all courses with lessons and enrollments (including enrolled user details).

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response `200`:**

```json
[
  {
    "id": 1,
    "title": "Introduction to JavaScript",
    "description": "Learn JS from scratch",
    "imageUrl": "https://example.com/js.png",
    "price": 29.99,
    "published": true,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z",
    "lessons": [
      {
        "id": 1,
        "title": "Variables and Types",
        "content": "In this lesson...",
        "videoId": "https://example.com/video1.mp4",
        "courseId": 1,
        "sequence": 1,
        "createdAt": "2026-07-21T04:00:00.000Z",
        "updatedAt": "2026-07-21T04:00:00.000Z"
      }
    ],
    "enrollments": [
      {
        "id": 1,
        "userId": 1,
        "courseId": 1,
        "createdAt": "2026-07-21T04:00:00.000Z",
        "updatedAt": "2026-07-21T04:00:00.000Z",
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "role": "USER",
          "createdAt": "2026-07-21T04:00:00.000Z",
          "updatedAt": "2026-07-21T04:00:00.000Z"
        }
      }
    ]
  }
]
```

**Error `500`:**

```json
{
  "message": "Internal server error"
}
```

---

#### `POST /api/admin/courses`

Create a new course. Supports optional image upload via `multipart/form-data` (uploaded to S3).

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Fields:**

| Field         | Type    | Required | Description                        |
| ------------- | ------- | -------- | ---------------------------------- |
| `title`       | string  | Yes      | Course title                       |
| `description` | string  | No       | Course description                 |
| `price`       | number  | No       | Course price (default `0`)         |
| `published`   | boolean | No       | Published status (default `false`) |
| `image`       | file    | No       | Course image (uploaded to S3)      |

**Response `201`:**

```json
{
  "id": 2,
  "title": "Advanced CSS",
  "description": "Master CSS layouts",
  "imageUrl": "https://bucket.example.com/1753084800000.png",
  "price": 0,
  "published": false,
  "createdAt": "2026-07-21T04:00:00.000Z",
  "updatedAt": "2026-07-21T04:00:00.000Z"
}
```

**Response `201` (without image):**

```json
{
  "id": 2,
  "title": "Advanced CSS",
  "description": "Master CSS layouts",
  "imageUrl": null,
  "price": 0,
  "published": false,
  "createdAt": "2026-07-21T04:00:00.000Z",
  "updatedAt": "2026-07-21T04:00:00.000Z"
}
```

**Error `500`:**

```json
{
  "message": "Internal server error"
}
```

---

#### `PUT /api/admin/courses/:id`

Update an existing course.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Course ID   |

**Request Body:**

```json
{
  "title": "Advanced CSS — Updated",
  "description": "Master modern CSS layouts",
  "price": 19.99,
  "published": true
}
```

| Field         | Type    | Required | Description        |
| ------------- | ------- | -------- | ------------------ |
| `title`       | string  | No       | Course title       |
| `description` | string  | No       | Course description |
| `imageUrl`    | string  | No       | Image URL          |
| `price`       | number  | No       | Course price       |
| `published`   | boolean | No       | Published status   |

**Response `200`:**

```json
{
  "id": 2,
  "title": "Advanced CSS — Updated",
  "description": "Master modern CSS layouts",
  "imageUrl": null,
  "price": 19.99,
  "published": true,
  "createdAt": "2026-07-21T04:00:00.000Z",
  "updatedAt": "2026-07-21T05:00:00.000Z"
}
```

**Error `500`:**

```json
{
  "message": "Internal server error"
}
```

---

#### `DELETE /api/admin/courses/:id`

Delete a course.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Course ID   |

**Request Body:** None

**Response `204`:** No content.

**Error `500`:**

```json
{
  "message": "Internal server error"
}
```

---

#### `GET /api/admin/lessons`

Get all lessons with their course and progress data.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response `200`:**

```json
[
  {
    "id": 1,
    "title": "Variables and Types",
    "content": "In this lesson...",
    "videoId": "https://example.com/video1.mp4",
    "courseId": 1,
    "sequence": 1,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z",
    "course": {
      "id": 1,
      "title": "Introduction to JavaScript",
      "description": "Learn JS from scratch",
      "imageUrl": null,
      "price": 0,
      "published": false,
      "createdAt": "2026-07-21T04:00:00.000Z",
      "updatedAt": "2026-07-21T04:00:00.000Z"
    },
    "progress": []
  }
]
```

**Error `500`:**

```json
{
  "message": "Internal server error"
}
```

---

#### `POST /api/admin/lessons`

Create a new lesson.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "Functions and Scope",
  "content": "In this lesson we cover...",
  "videoId": "https://example.com/video2.mp4",
  "courseId": 1,
  "sequence": 2
}
```

| Field      | Type   | Required | Description                |
| ---------- | ------ | -------- | -------------------------- |
| `title`    | string | Yes      | Lesson title               |
| `content`  | string | Yes      | Lesson content (text/HTML) |
| `videoId`  | string | No       | Video URL/ID               |
| `courseId` | number | Yes      | Parent course ID           |
| `sequence` | number | Yes      | Sequence order             |

**Response `201`:**

```json
{
  "id": 2,
  "title": "Functions and Scope",
  "content": "In this lesson we cover...",
  "videoId": "https://example.com/video2.mp4",
  "courseId": 1,
  "sequence": 2,
  "createdAt": "2026-07-21T04:00:00.000Z",
  "updatedAt": "2026-07-21T04:00:00.000Z"
}
```

**Error `500`:**

```json
{
  "message": "Internal server error"
}
```

---

#### `PUT /api/admin/lessons/:id`

Update an existing lesson.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Lesson ID   |

**Request Body:**

```json
{
  "title": "Functions and Scope — Updated",
  "content": "Updated lesson content...",
  "videoId": "https://example.com/video2-v2.mp4"
}
```

| Field      | Type   | Required | Description      |
| ---------- | ------ | -------- | ---------------- |
| `title`    | string | No       | Lesson title     |
| `content`  | string | No       | Lesson content   |
| `videoId`  | string | No       | Video URL/ID     |
| `courseId` | number | No       | Parent course ID |
| `sequence` | number | No       | Sequence order   |

**Response `200`:**

```json
{
  "id": 2,
  "title": "Functions and Scope — Updated",
  "content": "Updated lesson content...",
  "videoId": "https://example.com/video2-v2.mp4",
  "courseId": 1,
  "sequence": 2,
  "createdAt": "2026-07-21T04:00:00.000Z",
  "updatedAt": "2026-07-21T05:00:00.000Z"
}
```

**Error `500`:**

```json
{
  "message": "Internal server error"
}
```

---

#### `DELETE /api/admin/lessons/:id`

Delete a lesson.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | number | Lesson ID   |

**Request Body:** None

**Response `204`:** No content.

**Error `500`:**

```json
{
  "message": "Internal server error"
}
```

---

#### `POST /api/admin/send-notification`

Send a push notification to a specific device via Firebase Cloud Messaging.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "New Course Available!",
  "body": "Check out our latest course on React.",
  "token": "eJ7xk9..."
}
```

| Field   | Type   | Required | Description               |
| ------- | ------ | -------- | ------------------------- |
| `title` | string | Yes      | Notification title        |
| `body`  | string | Yes      | Notification body text    |
| `token` | string | Yes      | Target device's FCM token |

**Response `200`:**

```json
{
  "message": "Notification sent successfully",
  "response": "projects/my-project/messages/1234567890"
}
```

**Error `400`:**

```json
{
  "message": "Title, body, and token are required"
}
```

```json
{
  "message": "Invalid FCM token. Token has been removed."
}
```

---

#### `GET /api/admin/fcm-tokens`

Get all FCM tokens for all users.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response `200`:**

```json
{
  "fcmTokens": ["eJ7xk9...", "fK8yL0...", null]
}
```

---

#### `GET /api/admin/fcm-token/:userId`

Get the FCM token for a specific user.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param    | Type   | Description |
| -------- | ------ | ----------- |
| `userId` | number | User ID     |

**Response `200`:**

```json
{
  "fcmToken": "eJ7xk9..."
}
```

**Error `404`:**

```json
{
  "message": "FCM token not found"
}
```

---

#### `GET /api/admin/quizzes/course/:courseId`

Get the quiz for a specific course, including questions and answers.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param      | Type   | Description |
| ---------- | ------ | ----------- |
| `courseId` | number | Course ID   |

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "title": "JavaScript Basics Quiz",
    "courseId": 1,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z",
    "questions": [
      {
        "id": 1,
        "question": "What is JavaScript?",
        "quizId": 1,
        "sequence": 1,
        "createdAt": "2026-07-21T04:00:00.000Z",
        "updatedAt": "2026-07-21T04:00:00.000Z",
        "answers": [
          {
            "id": 1,
            "answer": "A programming language",
            "correct": true,
            "questionId": 1,
            "createdAt": "2026-07-21T04:00:00.000Z",
            "updatedAt": "2026-07-21T04:00:00.000Z"
          }
        ]
      }
    ]
  }
}
```

**Error `404`:**

```json
{
  "error": "Quiz not found for this course"
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

#### `POST /api/admin/quizzes`

Create a new quiz for a course.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "courseId": 1,
  "title": "JavaScript Basics Quiz"
}
```

| Field      | Type   | Required | Description      |
| ---------- | ------ | -------- | ---------------- |
| `courseId` | number | Yes      | Parent course ID |
| `title`    | string | Yes      | Quiz title       |

**Response `201`:**

```json
{
  "data": {
    "id": 1,
    "title": "JavaScript Basics Quiz",
    "courseId": 1,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z"
  }
}
```

**Error `400`:**

```json
{
  "error": "Invalid quiz data"
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

#### `POST /api/admin/questions`

Create a question in a quiz.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "quizId": 1,
  "question": "What is JS?",
  "sequence": 1
}
```

| Field      | Type   | Required | Description                 |
| ---------- | ------ | -------- | --------------------------- |
| `quizId`   | number | Yes      | Parent quiz ID              |
| `question` | string | Yes      | The question text           |
| `sequence` | number | Yes      | Sequence order of questions |

**Response `201`:**

```json
{
  "data": {
    "id": 1,
    "question": "What is JS?",
    "quizId": 1,
    "sequence": 1,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z"
  }
}
```

**Error `400`:**

```json
{
  "error": "Invalid question data"
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

#### `POST /api/admin/answers`

Create an answer option for a question.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "questionId": 1,
  "answer": "A programming language",
  "correct": true
}
```

| Field        | Type    | Required | Description                           |
| ------------ | ------- | -------- | ------------------------------------- |
| `questionId` | number  | Yes      | Parent question ID                    |
| `answer`     | string  | Yes      | Answer option text                    |
| `correct`    | boolean | Yes      | Whether this answer option is correct |

**Response `201`:**

```json
{
  "data": {
    "id": 1,
    "answer": "A programming language",
    "correct": true,
    "questionId": 1,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z"
  }
}
```

**Error `400`:**

```json
{
  "error": "Invalid answer data"
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

#### `GET /api/admin/quiz-attempts/user/:userId`

Get all quiz attempts for a specific user.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param    | Type   | Description |
| -------- | ------ | ----------- |
| `userId` | number | User ID     |

**Response `200`:**

```json
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "quizId": 1,
      "score": 100,
      "passed": true,
      "createdAt": "2026-07-21T04:00:00.000Z",
      "updatedAt": "2026-07-21T04:00:00.000Z",
      "answers": [
        {
          "id": 1,
          "attemptId": 1,
          "answerId": 1,
          "answer": {
            "id": 1,
            "answer": "A programming language",
            "correct": true,
            "questionId": 1,
            "createdAt": "2026-07-21T04:00:00.000Z",
            "updatedAt": "2026-07-21T04:00:00.000Z"
          }
        }
      ]
    }
  ]
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

#### `GET /api/admin/quiz-attempts/:attemptId`

Get details of a specific quiz attempt.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param       | Type   | Description     |
| ----------- | ------ | --------------- |
| `attemptId` | number | Quiz attempt ID |

**Response `200`:**

```json
{
  "data": {
    "id": 1,
    "userId": 1,
    "quizId": 1,
    "score": 100,
    "passed": true,
    "createdAt": "2026-07-21T04:00:00.000Z",
    "updatedAt": "2026-07-21T04:00:00.000Z",
    "answers": [
      {
        "id": 1,
        "attemptId": 1,
        "answerId": 1,
        "answer": {
          "id": 1,
          "answer": "A programming language",
          "correct": true,
          "questionId": 1,
          "createdAt": "2026-07-21T04:00:00.000Z",
          "updatedAt": "2026-07-21T04:00:00.000Z"
        }
      }
    ]
  }
}
```

**Error `404`:**

```json
{
  "error": "Quiz attempt not found"
}
```

**Error `500`:**

```json
{
  "error": "Internal server error"
}
```

---

#### `POST /api/admin/enrollments/acccpet/:enrollmentId`

Accept and approve an enrollment request. Note: The URL path is spelled `/acccpet/`.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param          | Type   | Description   |
| -------------- | ------ | ------------- |
| `enrollmentId` | number | Enrollment ID |

**Response `200`:**

```json
{
  "id": 1,
  "userId": 1,
  "courseId": 1,
  "approved": true,
  "createdAt": "2026-07-21T04:00:00.000Z",
  "updatedAt": "2026-07-21T04:00:00.000Z"
}
```

**Error `500`:**

```json
{
  "message": "Internal server error"
}
```

---

#### `POST /api/admin/enrollments/reject/:enrollmentId`

Reject and disapprove an enrollment request.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Params:**

| Param          | Type   | Description   |
| -------------- | ------ | ------------- |
| `enrollmentId` | number | Enrollment ID |

**Response `200`:**

```json
{
  "id": 1,
  "userId": 1,
  "courseId": 1,
  "approved": false,
  "createdAt": "2026-07-21T04:00:00.000Z",
  "updatedAt": "2026-07-21T04:00:00.000Z"
}
```

**Error `500`:**

```json
{
  "message": "Internal server error"
}
```

---

## Error Responses

All endpoints may return the following common errors:

| Status | Response                                                   | Cause                             |
| ------ | ---------------------------------------------------------- | --------------------------------- |
| `400`  | `{ "error": "Validation error details..." }`               | Request body failed validation    |
| `401`  | `{ "message": "Authorization header missing or invalid" }` | Missing or malformed Bearer token |
| `401`  | `{ "message": "Invalid or expired token" }`                | Expired or tampered access token  |
| `401`  | `{ "message": "User not found" }`                          | Token references a deleted user   |
| `500`  | `{ "error": "Internal server error" }`                     | Unexpected server-side failure    |

---

## Database Schema

```
Users ──< Enrollment >── Courses ──< Lessons
  │          │               │           │
  │          │               └───< Quizzes ───< Questions ───< Answers
  │          │                       │                             ▲
  │          │                       └───< QuizAttempt >──< UserQuizAnswer
  └──────< LessonProgress >────────────┘
```

- **Users** — name, email (unique), password, role (`USER` | `ADMIN`), fcmToken
- **Courses** — title, description, imageUrl, price, published
- **Lessons** — title, content, videoId, sequence, linked to a course
- **Enrollment** — links a user to a course (unique per `[userId, courseId]`), contains approved status (`boolean`)
- **LessonProgress** — tracks lesson completion per user (unique per `[userId, lessonId]`)
- **Quizzes** — title, linked to a course
- **Questions** — question, sequence, linked to a quiz
- **Answers** — answer, correct flag, linked to a question
- **QuizAttempt** — score, passed flag, linked to a user and quiz
- **UserQuizAnswer** — links an attempt to the selected answer option

## Project Structure

```
src/
├── app.js                  # Express app entry point
├── features/
│   ├── admin/              # Admin routes & controller (requires admin role)
│   ├── authentication/     # Auth routes & controller
│   ├── courses/            # Course routes & controller
│   ├── lessons/            # Lesson routes & controller
│   ├── quizzes/            # Quiz routes & controller
│   └── user/               # User profile & FCM token management
├── middlewares/
│   ├── auth.middleware.js   # checkAuth, isAdmin
│   └── upload.middleware.js # S3 file upload (multer-s3)
├── models/                 # Prisma data-access layer
├── schemas/                # Joi validation schemas
├── utils/
│   ├── firebase.js         # Firebase Admin SDK initialization
│   ├── prisma.js           # Prisma client instance
│   └── s3.js               # S3 client configuration
└── generated/
    └── prisma/             # Generated Prisma client
```

## Scripts

| Script         | Command                | Description                            |
| -------------- | ---------------------- | -------------------------------------- |
| `dev`          | `bun run dev`          | Start with nodemon                     |
| `start`        | `bun run start`        | Start in production                    |
| `format`       | `bun run format`       | Format code with Prettier              |
| `check format` | `bun run format:check` | Check Format of the code with Prettier |
