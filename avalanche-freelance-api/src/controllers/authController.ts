import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { signupSchema, loginSchema } from '../validation/schemas';
import { logger } from '../config/logger';

// Generate JWT token
const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  } as jwt.SignOptions);
};

// Create and send token response
const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken((user._id as any).toString());
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN!) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: userObj
    }
  });
};

// User signup
export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Validate input
  const validatedData = signupSchema.parse(req.body);
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: validatedData.email });

  if (existingUser) {
    logger.warn('Registration attempt with existing email', {
      email: validatedData.email,
      ip: req.ip
    });
    return next(new AppError('User with this email already exists', 409));
  }

  // Create new user with complete data persistence
  const userData = {
    name: validatedData.name,
    email: validatedData.email,
    password: validatedData.password,
    role: validatedData.role,
    // Handle optional phone field properly
    ...(validatedData.phone && validatedData.phone.trim() !== '' && { phone: validatedData.phone }),
    // Initialize profile based on role
    profile: {
      bio: '',
      skills: [],
      location: '',
      ...(validatedData.role === 'freelancer' && { hourlyRate: 0 }),
      portfolio: [],
      experience: [],
      education: []
    },
    isActive: true,
    isVerified: false
  };

  const newUser = await User.create(userData);

  logger.auth('User registration successful', {
    userId: newUser._id,
    email: newUser.email,
    role: newUser.role,
    hasPhone: !!newUser.phone
  });

  createSendToken(newUser, 201, res);
});

// User login
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Validate input
  const { email, password } = loginSchema.parse(req.body);

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    logger.warn('Failed login attempt', {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    return next(new AppError('Incorrect email or password', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    logger.warn('Login attempt on deactivated account', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  logger.auth('User login successful', {
    userId: user._id,
    email: user.email,
    role: user.role,
    ip: req.ip
  });

  createSendToken(user, 200, res);
});

// User logout
export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  logger.auth('User logout', {
    ip: req.ip
  });
  
  res.status(200).json({ 
    status: 'success',
    message: 'Logged out successfully'
  });
};

// Protect middleware - verify JWT token
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get token from header or cookie
  let token: string | undefined;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; iat: number };

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Restrict to specific roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Get current user
export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!._id).populate('ratings.reviews.reviewerId', 'name avatar');
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update password
export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError('Please provide current password, new password, and confirm password', 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError('New password and confirm password do not match', 400));
  }

  if (newPassword.length < 8) {
    return next(new AppError('New password must be at least 8 characters long', 400));
  }

  // Get user with password
  const user = await User.findById(req.user!._id).select('+password');

  if (!user || !(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password updated for user: ${user.email}`);

  createSendToken(user, 200, res);
});

// Deactivate account
export const deactivateAccount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await User.findByIdAndUpdate(req.user!._id, { isActive: false });

  logger.info(`Account deactivated: ${req.user!.email}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Verify email (placeholder for email verification system)
export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  // In a real implementation, you would verify the email verification token
  // For now, we'll just mark the user as verified
  const user = await User.findById(req.user!._id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  logger.info(`Email verified for user: ${user.email}`);

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

// Get user statistics
export const getUserStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!._id;

  // Get basic user stats
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // In a real implementation, you would aggregate data from related collections
  const stats = {
    profile: {
      completionPercentage: calculateProfileCompletion(user),
      isVerified: user.isVerified,
      memberSince: user.createdAt,
      lastLogin: user.lastLogin
    },
    ratings: {
      average: user.ratings.average,
      count: user.ratings.count,
      distribution: calculateRatingDistribution(user.ratings.reviews)
    }
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// Helper function to calculate profile completion
const calculateProfileCompletion = (user: IUser): number => {
  let completedFields = 0;
  const totalFields = 10;

  if (user.name) completedFields++;
  if (user.email) completedFields++;
  if (user.phone) completedFields++;
  if (user.profile?.bio) completedFields++;
  if (user.profile?.skills && user.profile.skills.length > 0) completedFields++;
  if (user.profile?.location) completedFields++;
  if (user.profile?.avatar) completedFields++;
  if (user.profile?.portfolio && user.profile.portfolio.length > 0) completedFields++;
  if (user.profile?.experience && user.profile.experience.length > 0) completedFields++;
  if (user.profile?.education && user.profile.education.length > 0) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};

// Helper function to calculate rating distribution
const calculateRatingDistribution = (reviews: any[]): { [key: number]: number } => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    distribution[review.rating]++;
  });

  return distribution;
};
