import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { profileUpdateSchema, paginationSchema } from '../validation/schemas';
import { logger } from '../utils/logger';

// Update user profile
export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Validate input
  const validatedData = profileUpdateSchema.parse(req.body);
  
  // Remove sensitive fields that shouldn't be updated here
  const { password, role, isVerified, isActive, ...updateData } = validatedData as any;

  // Check if email is being updated and if it's already taken
  if (updateData.email && updateData.email !== req.user!.email) {
    const existingUser = await User.findOne({ email: updateData.email });
    if (existingUser) {
      return next(new AppError('Email is already taken', 409));
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.user!._id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  logger.info(`Profile updated for user: ${updatedUser.email}`);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Get user profile by ID
export const getUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .populate('ratings.reviews.reviewerId', 'name profile.avatar')
    .select('-__v');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Don't expose sensitive information for other users
  const publicProfile = {
    _id: user._id,
    name: user.name,
    role: user.role,
    profile: user.profile,
    ratings: user.ratings,
    isVerified: user.isVerified,
    createdAt: user.createdAt
  };

  res.status(200).json({
    status: 'success',
    data: {
      user: publicProfile
    }
  });
});

// Search users (for finding freelancers/clients)
export const searchUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10 } = paginationSchema.parse(req.query);
  const { 
    role, 
    skills, 
    location, 
    minRating, 
    search,
    sortBy = 'ratings.average',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query: any = { isActive: true };

  if (role) {
    query.role = role;
  }

  if (skills) {
    const skillsArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
    query['profile.skills'] = { $in: skillsArray };
  }

  if (location) {
    query['profile.location'] = { $regex: location, $options: 'i' };
  }

  if (minRating) {
    query['ratings.average'] = { $gte: parseFloat(minRating as string) };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'profile.bio': { $regex: search, $options: 'i' } },
      { 'profile.skills': { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const users = await User.find(query)
    .select('name role profile ratings isVerified createdAt')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: users.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      users
    }
  });
});

// Add portfolio item
export const addPortfolioItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, url, image } = req.body;

  if (!title || !description || !url) {
    return next(new AppError('Title, description, and URL are required', 400));
  }

  const user = await User.findById(req.user!._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Initialize profile if it doesn't exist
  if (!user.profile) {
    user.profile = {};
  }
  if (!user.profile.portfolio) {
    user.profile.portfolio = [];
  }

  // Add portfolio item
  user.profile.portfolio.push({
    title: title.trim(),
    description: description.trim(),
    url: url.trim(),
    image: image?.trim()
  });

  await user.save();

  logger.info(`Portfolio item added for user: ${user.email}`);

  res.status(201).json({
    status: 'success',
    data: {
      portfolio: user.profile.portfolio
    }
  });
});

// Update portfolio item
export const updatePortfolioItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { portfolioId } = req.params;
  const { title, description, url, image } = req.body;

  const user = await User.findById(req.user!._id);
  if (!user || !user.profile?.portfolio) {
    return next(new AppError('Portfolio not found', 404));
  }

  const portfolioItem = user.profile.portfolio.id(portfolioId);
  if (!portfolioItem) {
    return next(new AppError('Portfolio item not found', 404));
  }

  // Update fields
  if (title) portfolioItem.title = title.trim();
  if (description) portfolioItem.description = description.trim();
  if (url) portfolioItem.url = url.trim();
  if (image !== undefined) portfolioItem.image = image?.trim();

  await user.save();

  logger.info(`Portfolio item updated for user: ${user.email}`);

  res.status(200).json({
    status: 'success',
    data: {
      portfolio: user.profile.portfolio
    }
  });
});

// Delete portfolio item
export const deletePortfolioItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { portfolioId } = req.params;

  const user = await User.findById(req.user!._id);
  if (!user || !user.profile?.portfolio) {
    return next(new AppError('Portfolio not found', 404));
  }

  const portfolioItem = user.profile.portfolio.id(portfolioId);
  if (!portfolioItem) {
    return next(new AppError('Portfolio item not found', 404));
  }

  portfolioItem.deleteOne();
  await user.save();

  logger.info(`Portfolio item deleted for user: ${user.email}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Add experience
export const addExperience = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { company, position, startDate, endDate, description } = req.body;

  if (!company || !position || !startDate) {
    return next(new AppError('Company, position, and start date are required', 400));
  }

  const user = await User.findById(req.user!._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Initialize profile if it doesn't exist
  if (!user.profile) {
    user.profile = {};
  }
  if (!user.profile.experience) {
    user.profile.experience = [];
  }

  // Add experience
  user.profile.experience.push({
    company: company.trim(),
    position: position.trim(),
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : undefined,
    description: description?.trim()
  });

  await user.save();

  logger.info(`Experience added for user: ${user.email}`);

  res.status(201).json({
    status: 'success',
    data: {
      experience: user.profile.experience
    }
  });
});

// Add education
export const addEducation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { institution, degree, field, startDate, endDate } = req.body;

  if (!institution || !degree || !field || !startDate) {
    return next(new AppError('Institution, degree, field, and start date are required', 400));
  }

  const user = await User.findById(req.user!._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Initialize profile if it doesn't exist
  if (!user.profile) {
    user.profile = {};
  }
  if (!user.profile.education) {
    user.profile.education = [];
  }

  // Add education
  user.profile.education.push({
    institution: institution.trim(),
    degree: degree.trim(),
    field: field.trim(),
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : undefined
  });

  await user.save();

  logger.info(`Education added for user: ${user.email}`);

  res.status(201).json({
    status: 'success',
    data: {
      education: user.profile.education
    }
  });
});

// Add review/rating
export const addReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  if (userId === req.user!._id.toString()) {
    return next(new AppError('You cannot review yourself', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if user has already reviewed this person
  const existingReview = user.ratings.reviews.find(
    review => review.reviewerId.toString() === req.user!._id.toString()
  );

  if (existingReview) {
    return next(new AppError('You have already reviewed this user', 409));
  }

  // Add review
  user.ratings.reviews.push({
    reviewerId: req.user!._id,
    rating: parseInt(rating),
    comment: comment?.trim(),
    createdAt: new Date()
  });

  await user.save();

  logger.info(`Review added for user: ${user.email} by ${req.user!.email}`);

  res.status(201).json({
    status: 'success',
    data: {
      ratings: user.ratings
    }
  });
});

// Get user dashboard data
export const getDashboardData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user!._id;
  const userRole = req.user!.role;

  // Get user with populated data
  const user = await User.findById(userId)
    .populate('ratings.reviews.reviewerId', 'name profile.avatar');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Calculate profile completion
  const profileCompletion = calculateProfileCompletion(user);

  const dashboardData = {
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      ratings: user.ratings,
      isVerified: user.isVerified,
      profileCompletion
    },
    // In a real implementation, you would fetch related data like jobs, proposals, etc.
    stats: {
      totalEarnings: 0, // Would be calculated from completed jobs
      activeProjects: 0, // Would be fetched from job/proposal collections
      completedProjects: 0,
      responseRate: 100
    }
  };

  res.status(200).json({
    status: 'success',
    data: dashboardData
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
