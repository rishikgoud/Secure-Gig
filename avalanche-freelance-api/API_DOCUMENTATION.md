# Avalanche Freelance API Documentation

## Overview

Production-ready Express.js API for a decentralized freelance marketplace with comprehensive user management, job posting, and authentication features. Built with TypeScript, MongoDB, and robust validation.

## Base URL
```
http://localhost:4000/api
```

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Or the token will be automatically included via HTTP-only cookies.

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "client", // or "freelancer"
  "phone": "+1234567890", // optional
  "walletAddress": "0x..." // optional
}
```

**Response:**
```json
{
  "status": "success",
  "token": "jwt-token-here",
  "data": {
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client",
      "isVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### POST /api/auth/logout
Logout and clear authentication cookies.

#### GET /api/auth/me
Get current user information (requires authentication).

#### PATCH /api/auth/update-password
Update user password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}
```

### User Management Routes (`/api/users`)

#### PATCH /api/users/profile
Update user profile (requires authentication).

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1234567890",
  "profile": {
    "bio": "Professional developer with 5+ years experience",
    "skills": ["JavaScript", "React", "Node.js"],
    "hourlyRate": 75,
    "location": "San Francisco, CA",
    "website": "https://johndoe.dev"
  }
}
```

#### GET /api/users/profile/:userId
Get public profile of a user.

#### GET /api/users/search
Search for users (freelancers/clients).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10, max: 100)
- `role`: Filter by role ("client" or "freelancer")
- `skills`: Comma-separated list of skills
- `location`: Location filter
- `minRating`: Minimum rating filter
- `search`: Text search in name, bio, skills

#### POST /api/users/portfolio
Add portfolio item (requires authentication).

**Request Body:**
```json
{
  "title": "E-commerce Website",
  "description": "Full-stack e-commerce solution built with React and Node.js",
  "url": "https://example-project.com",
  "image": "https://example.com/screenshot.png"
}
```

#### PATCH /api/users/portfolio/:portfolioId
Update portfolio item.

#### DELETE /api/users/portfolio/:portfolioId
Delete portfolio item.

#### POST /api/users/experience
Add work experience.

**Request Body:**
```json
{
  "company": "Tech Corp",
  "position": "Senior Developer",
  "startDate": "2020-01-01",
  "endDate": "2023-12-31",
  "description": "Led development of multiple web applications"
}
```

#### POST /api/users/:userId/review
Add review/rating for a user.

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent work quality and communication"
}
```

### Job Management Routes (`/api/jobs`)

#### POST /api/jobs
Create a new job post (clients only).

**Request Body:**
```json
{
  "title": "Full-Stack Developer for E-commerce Platform",
  "description": "We need an experienced developer to build a modern e-commerce platform...",
  "category": "web-development",
  "skills": ["React", "Node.js", "MongoDB", "TypeScript"],
  "budget": {
    "type": "fixed",
    "amount": 5000,
    "currency": "USD"
  },
  "timeline": {
    "duration": 8,
    "unit": "weeks",
    "startDate": "2024-02-01T00:00:00.000Z"
  },
  "requirements": {
    "experienceLevel": "intermediate",
    "minimumRating": 4.0,
    "portfolioRequired": true
  },
  "location": {
    "type": "remote"
  }
}
```

#### GET /api/jobs
Get all active job posts with filtering and pagination.

**Query Parameters:**
- `page`: Page number
- `limit`: Results per page
- `search`: Text search
- `category`: Job category
- `skills`: Comma-separated skills
- `budgetMin`: Minimum budget
- `budgetMax`: Maximum budget
- `budgetType`: "fixed" or "hourly"
- `experienceLevel`: "entry", "intermediate", "expert"
- `locationType`: "remote", "onsite", "hybrid"
- `sortBy`: Sort field (default: "createdAt")
- `sortOrder`: "asc" or "desc"

#### GET /api/jobs/:jobId
Get single job post details.

#### GET /api/jobs/my/posts
Get client's own job posts (clients only).

#### PATCH /api/jobs/:jobId
Update job post (job owner only).

#### DELETE /api/jobs/:jobId
Delete job post (job owner only).

#### PATCH /api/jobs/:jobId/status
Update job status.

**Request Body:**
```json
{
  "status": "active" // "draft", "active", "paused", "completed", "cancelled"
}
```

#### GET /api/jobs/featured
Get featured job posts.

#### GET /api/jobs/categories
Get job categories with counts.

#### GET /api/jobs/skills/popular
Get popular skills.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

## Validation

All inputs are validated using Zod schemas. Validation errors return detailed information:

```json
{
  "status": "error",
  "message": "Validation error: name: Name must be at least 2 characters long, email: Please enter a valid email address"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Limits vary by endpoint type:
- Authentication: 5 requests per minute
- General API: 100 requests per minute
- Search: 50 requests per minute

## Environment Variables

Required environment variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/freelance-marketplace

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Blockchain (existing)
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your-private-key
AVACLOUD_API_KEY=your-avacloud-api-key
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start development server:
```bash
npm run dev
```

4. The API will be available at `http://localhost:4000`

## Testing

Run the test suite:
```bash
npm test
```

## Production Deployment

1. Build the project:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## Frontend Integration

The API is designed to work seamlessly with the existing React frontend. Key integration points:

### Authentication Flow
1. User signs up/logs in via `/api/auth/signup` or `/api/auth/login`
2. JWT token is stored in HTTP-only cookie
3. Frontend makes authenticated requests with automatic cookie inclusion
4. Use `/api/auth/me` to get current user state

### Job Posting Flow
1. Client creates job via `/api/jobs`
2. Job appears in public listings via `/api/jobs`
3. Freelancers can view job details via `/api/jobs/:jobId`
4. Client manages jobs via `/api/jobs/my/posts`

### User Profile Management
1. Users update profiles via `/api/users/profile`
2. Public profiles accessible via `/api/users/profile/:userId`
3. Portfolio, experience, and education managed via respective endpoints

## Security Features

- Password hashing with bcrypt (salt rounds: 12)
- JWT token authentication with HTTP-only cookies
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Rate limiting
- MongoDB injection protection
- XSS protection through input validation
