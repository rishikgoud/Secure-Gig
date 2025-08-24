# Authentication System Documentation

## Overview
Production-quality login and signup system for SecureGig decentralized freelance marketplace. Fully synchronized with backend Express API and MongoDB User schema.

## Features

### ✅ Frontend Validation
- **Zod schemas** matching backend validation exactly
- **React Hook Form** integration with real-time validation
- **Field-level error handling** with user-friendly messages
- **Password strength requirements** (8+ chars, uppercase, lowercase, number)
- **Email format validation** and uniqueness checking
- **Phone number validation** (optional field)
- **Role selection** (client/freelancer) with descriptions

### ✅ Authentication Flow
- **Secure API integration** with backend `/api/auth/login` and `/api/auth/signup`
- **JWT token management** with localStorage persistence
- **Automatic redirect** to wallet connection page after successful auth
- **Protected route guards** preventing unauthorized access
- **Role-based access control** for client/freelancer specific pages
- **Session persistence** across browser refreshes

### ✅ Security & Best Practices
- **CORS-enabled** API calls with credentials
- **Input sanitization** and validation on frontend
- **Secure token storage** in localStorage
- **Error handling** for network issues and API errors
- **Loading states** and user feedback
- **Async/await patterns** with proper error catching

## File Structure

```
src/
├── schemas/
│   └── authSchemas.ts          # Zod validation schemas
├── services/
│   └── authService.ts          # API calls and auth utilities
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx       # Login component
│   │   └── SignupForm.tsx      # Signup component
│   └── guards/
│       └── ProtectedRoute.tsx  # Route protection
├── pages/
│   ├── LoginPage.tsx           # Login page wrapper
│   └── SignupPage.tsx          # Signup page wrapper
├── store/
│   └── authStore.ts            # Zustand global state
└── App.tsx                     # Updated with protected routes
```

## Backend Synchronization

### User Schema Fields (Matched)
- `name`: 2-50 characters, required
- `email`: Valid email format, unique, required
- `phone`: Optional, valid phone number format
- `password`: 8+ characters with complexity requirements
- `role`: 'client' | 'freelancer', required

### API Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Response Format
```typescript
{
  status: 'success',
  token: 'jwt_token_here',
  data: {
    user: {
      _id: string,
      name: string,
      email: string,
      role: 'client' | 'freelancer',
      // ... other user fields
    }
  }
}
```

## Usage

### 1. Login Flow
```typescript
// Navigate to /login
// User fills form with email/password
// Form validates with Zod schema
// API call to /api/auth/login
// Store user data and token
// Redirect to /wallet-connection
```

### 2. Signup Flow
```typescript
// Navigate to /signup
// User fills comprehensive form
// Frontend validation matches backend schema
// API call to /api/auth/signup
// Store user data and token
// Redirect to /wallet-connection
```

### 3. Protected Routes
```typescript
// All dashboard and user-specific routes protected
// Automatic redirect to /login if not authenticated
// Role-based access control for client/freelancer pages
// Session persistence across browser refreshes
```

## Integration Points

### With Existing Systems
- **Wallet Connection**: Users redirected after successful auth
- **Job Management**: Protected routes for My Gigs, proposals, etc.
- **User Profiles**: Auth store provides user data globally
- **API Client**: Automatic credential inclusion for authenticated requests

### State Management
- **Zustand store** for global auth state
- **localStorage persistence** for session management
- **Automatic initialization** on app start
- **Clean logout** with state clearing

## Error Handling

### Frontend Validation
- Real-time field validation
- Form submission prevention for invalid data
- Clear error messages matching backend constraints

### API Error Handling
- Network error detection
- Specific error messages for common issues (email exists, invalid credentials)
- Graceful fallback for unexpected errors
- User-friendly toast notifications

## Security Considerations

### Development
- CORS configured for localhost origins
- Credentials included in API requests
- Secure cookie settings for JWT

### Production Ready
- Environment-based CORS origins
- Secure cookie flags (httpOnly, secure, sameSite)
- Token expiration handling
- Account deactivation checks

## Testing

### Manual Testing
1. Navigate to `/signup` - verify form validation
2. Create account with valid data - should redirect to wallet connection
3. Navigate to `/login` - verify login with created account
4. Try accessing protected routes - should require authentication
5. Test logout functionality - should clear state and redirect

### Integration Testing
- Backend API endpoints responding correctly
- CORS headers allowing frontend requests
- JWT tokens being issued and validated
- User data persisting across sessions

## Next Steps

1. **Email Verification**: Implement email confirmation flow
2. **Password Reset**: Add forgot password functionality
3. **Social Login**: Add wallet-based authentication
4. **2FA**: Implement two-factor authentication
5. **Session Management**: Add token refresh logic
