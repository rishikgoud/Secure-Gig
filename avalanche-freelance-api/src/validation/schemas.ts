import { z } from 'zod';

// User validation schemas
export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .min(1, 'Phone number cannot be empty')
    .optional()
    .or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  role: z.enum(['client', 'freelancer'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be either client or freelancer'
  })
});

export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
});

export const profileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters')
    .trim()
    .optional(),
  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
    .optional(),
  profile: z.object({
    bio: z.string()
      .max(500, 'Bio cannot exceed 500 characters')
      .optional(),
    skills: z.array(z.string().trim().min(1))
      .max(20, 'Cannot have more than 20 skills')
      .optional(),
    hourlyRate: z.number()
      .min(0, 'Hourly rate cannot be negative')
      .optional(),
    location: z.string()
      .max(100, 'Location cannot exceed 100 characters')
      .trim()
      .optional(),
    website: z.string()
      .url('Please enter a valid website URL')
      .optional(),
    avatar: z.string().url().optional(),
    portfolio: z.array(z.object({
      title: z.string()
        .min(1, 'Portfolio title is required')
        .max(100, 'Portfolio title cannot exceed 100 characters')
        .trim(),
      description: z.string()
        .min(1, 'Portfolio description is required')
        .max(500, 'Portfolio description cannot exceed 500 characters'),
      url: z.string().url('Please enter a valid URL'),
      image: z.string().url().optional()
    })).optional(),
    experience: z.array(z.object({
      company: z.string()
        .min(1, 'Company name is required')
        .max(100, 'Company name cannot exceed 100 characters')
        .trim(),
      position: z.string()
        .min(1, 'Position is required')
        .max(100, 'Position cannot exceed 100 characters')
        .trim(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime().optional(),
      description: z.string()
        .max(500, 'Experience description cannot exceed 500 characters')
        .optional()
    })).optional(),
    education: z.array(z.object({
      institution: z.string()
        .min(1, 'Institution name is required')
        .max(100, 'Institution name cannot exceed 100 characters')
        .trim(),
      degree: z.string()
        .min(1, 'Degree is required')
        .max(100, 'Degree cannot exceed 100 characters')
        .trim(),
      field: z.string()
        .min(1, 'Field of study is required')
        .max(100, 'Field of study cannot exceed 100 characters')
        .trim(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime().optional()
    })).optional()
  }).optional()
});

// Job Post validation schemas
export const jobPostSchema = z.object({
  title: z.string()
    .min(10, 'Job title must be at least 10 characters long')
    .max(100, 'Job title cannot exceed 100 characters')
    .trim(),
  description: z.string()
    .min(50, 'Job description must be at least 50 characters long')
    .max(5000, 'Job description cannot exceed 5000 characters')
    .trim(),
  category: z.enum([
    'web-development',
    'mobile-development',
    'blockchain-development',
    'ui-ux-design',
    'graphic-design',
    'content-writing',
    'marketing',
    'data-science',
    'ai-ml',
    'devops',
    'consulting',
    'other'
  ], {
    required_error: 'Job category is required',
    invalid_type_error: 'Invalid job category'
  }),
  skills: z.array(z.string().trim().min(1))
    .min(1, 'At least one skill is required')
    .max(20, 'Cannot have more than 20 skills'),
  budget: z.object({
    type: z.enum(['fixed', 'hourly'], {
      required_error: 'Budget type is required'
    }),
    amount: z.number()
      .min(1, 'Budget amount must be greater than 0'),
    currency: z.enum(['USD', 'EUR', 'AVAX', 'ETH', 'BTC'])
      .default('USD')
  }),
  timeline: z.object({
    duration: z.number()
      .min(1, 'Duration must be at least 1'),
    unit: z.enum(['hours', 'days', 'weeks', 'months'], {
      required_error: 'Timeline unit is required'
    }),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  }),
  requirements: z.object({
    experienceLevel: z.enum(['entry', 'intermediate', 'expert'], {
      required_error: 'Experience level is required'
    }),
    minimumRating: z.number()
      .min(1, 'Minimum rating must be between 1 and 5')
      .max(5, 'Minimum rating must be between 1 and 5')
      .optional(),
    portfolioRequired: z.boolean().default(false),
    testRequired: z.boolean().default(false)
  }),
  location: z.object({
    type: z.enum(['remote', 'onsite', 'hybrid'], {
      required_error: 'Location type is required'
    }),
    city: z.string()
      .max(100, 'City name cannot exceed 100 characters')
      .trim()
      .optional(),
    country: z.string()
      .max(100, 'Country name cannot exceed 100 characters')
      .trim()
      .optional(),
    timezone: z.string().trim().optional()
  }),
  attachments: z.array(z.object({
    name: z.string()
      .min(1, 'File name is required')
      .max(255, 'File name cannot exceed 255 characters')
      .trim(),
    url: z.string().url('Please enter a valid file URL'),
    size: z.number()
      .max(10485760, 'File size cannot exceed 10MB'),
    type: z.enum(['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif'])
  })).optional(),
  visibility: z.enum(['public', 'private', 'invited'])
    .default('public'),
  escrow: z.object({
    isEnabled: z.boolean().default(false),
    contractAddress: z.string()
      .regex(/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid contract address')
      .optional(),
    amount: z.number()
      .min(0, 'Escrow amount cannot be negative')
      .optional()
  }).optional(),
  milestones: z.array(z.object({
    title: z.string()
      .min(1, 'Milestone title is required')
      .max(100, 'Milestone title cannot exceed 100 characters')
      .trim(),
    description: z.string()
      .min(1, 'Milestone description is required')
      .max(500, 'Milestone description cannot exceed 500 characters'),
    amount: z.number()
      .min(0, 'Milestone amount cannot be negative'),
    dueDate: z.string().datetime()
  })).optional(),
  tags: z.array(z.string()
    .trim()
    .max(30, 'Tag cannot exceed 30 characters'))
    .max(10, 'Cannot have more than 10 tags')
    .optional(),
  urgency: z.enum(['low', 'medium', 'high'])
    .default('medium')
});

export const jobPostUpdateSchema = jobPostSchema.partial().extend({
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).optional()
});

// Query validation schemas
export const jobSearchSchema = z.object({
  page: z.string()
    .transform(val => parseInt(val))
    .refine(val => val > 0, 'Page must be greater than 0')
    .default('1'),
  limit: z.string()
    .transform(val => parseInt(val))
    .refine(val => val > 0 && val <= 50, 'Limit must be between 1 and 50')
    .default('10'),
  search: z.string().trim().optional(),
  category: z.enum([
    'web-development',
    'mobile-development',
    'blockchain-development',
    'ui-ux-design',
    'graphic-design',
    'content-writing',
    'marketing',
    'data-science',
    'ai-ml',
    'devops',
    'consulting',
    'other'
  ]).optional(),
  skills: z.string()
    .transform(val => val.split(',').map(s => s.trim()).filter(s => s.length > 0))
    .optional(),
  budgetMin: z.string()
    .transform(val => parseFloat(val))
    .refine(val => val >= 0, 'Minimum budget must be non-negative')
    .optional(),
  budgetMax: z.string()
    .transform(val => parseFloat(val))
    .refine(val => val >= 0, 'Maximum budget must be non-negative')
    .optional(),
  budgetType: z.enum(['fixed', 'hourly']).optional(),
  experienceLevel: z.enum(['entry', 'intermediate', 'expert']).optional(),
  locationType: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  sortBy: z.enum(['createdAt', 'budget', 'applications', 'views'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'])
    .default('desc')
});

export const paginationSchema = z.object({
  page: z.string()
    .transform(val => parseInt(val))
    .refine(val => val > 0, 'Page must be greater than 0')
    .default('1'),
  limit: z.string()
    .transform(val => parseInt(val))
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .default('10')
});

// Proposal validation schemas
export const proposalSchema = z.object({
  jobId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid job ID format'),
  coverLetter: z.string()
    .min(50, 'Cover letter must be at least 50 characters long')
    .max(2000, 'Cover letter cannot exceed 2000 characters')
    .trim(),
  proposedRate: z.object({
    amount: z.number()
      .min(0, 'Proposed amount must be greater than or equal to 0'),
    currency: z.enum(['USD', 'AVAX', 'ETH'], {
      required_error: 'Currency is required'
    }),
    type: z.enum(['fixed', 'hourly'], {
      required_error: 'Rate type is required'
    })
  }),
  timeline: z.object({
    duration: z.number()
      .min(1, 'Duration must be at least 1'),
    unit: z.enum(['days', 'weeks', 'months'], {
      required_error: 'Timeline unit is required'
    }),
    startDate: z.string().datetime().optional()
  }),
  experience: z.string()
    .min(20, 'Experience description must be at least 20 characters long')
    .max(1000, 'Experience description cannot exceed 1000 characters')
    .trim(),
  portfolioLinks: z.array(z.string().url('Portfolio links must be valid URLs')).optional(),
  attachments: z.array(z.string()).optional()
});

export const updateProposalStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn', 'shortlisted'], {
    required_error: 'Status is required'
  }),
  clientResponse: z.object({
    message: z.string()
      .max(500, 'Response message cannot exceed 500 characters')
      .trim()
  }).optional()
});

// Type exports for TypeScript
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type JobPostInput = z.infer<typeof jobPostSchema>;
export type JobPostUpdateInput = z.infer<typeof jobPostUpdateSchema>;
export type JobSearchInput = z.infer<typeof jobSearchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProposalInput = z.infer<typeof proposalSchema>;
export type UpdateProposalStatusInput = z.infer<typeof updateProposalStatusSchema>;
