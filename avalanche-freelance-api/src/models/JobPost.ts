import mongoose, { Document, Schema } from 'mongoose';

export interface IJobPost extends Document {
  clientId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: {
    type: 'fixed' | 'hourly';
    amount: number;
    currency: string;
  };
  timeline: {
    duration: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
    startDate?: Date;
    endDate?: Date;
  };
  requirements: {
    experienceLevel: 'entry' | 'intermediate' | 'expert';
    minimumRating?: number;
    portfolioRequired: boolean;
    testRequired: boolean;
  };
  location: {
    type: 'remote' | 'onsite' | 'hybrid';
    city?: string;
    country?: string;
    timezone?: string;
  };
  attachments: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'invited';
  proposals: {
    count: number;
    received: mongoose.Types.ObjectId[];
  };
  escrow: {
    isEnabled: boolean;
    contractAddress?: string;
    amount?: number;
  };
  milestones: {
    title: string;
    description: string;
    amount: number;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'disputed';
  }[];
  tags: string[];
  featured: boolean;
  urgency: 'low' | 'medium' | 'high';
  applications: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobPostSchema: Schema = new Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [10, 'Job title must be at least 10 characters long'],
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    minlength: [50, 'Job description must be at least 50 characters long'],
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Job category is required'],
    enum: [
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
    ]
  },
  skills: [{
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  budget: {
    type: {
      type: String,
      enum: ['fixed', 'hourly'],
      required: [true, 'Budget type is required']
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [1, 'Budget amount must be greater than 0']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: ['USD', 'EUR', 'AVAX', 'ETH', 'BTC'],
      default: 'USD'
    }
  },
  timeline: {
    duration: {
      type: Number,
      required: [true, 'Timeline duration is required'],
      min: [1, 'Duration must be at least 1']
    },
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      required: [true, 'Timeline unit is required']
    },
    startDate: {
      type: Date,
      validate: {
        validator: function(startDate: Date) {
          return !startDate || startDate >= new Date();
        },
        message: 'Start date cannot be in the past'
      }
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(this: any, endDate: Date) {
          return !endDate || !this.timeline.startDate || endDate > this.timeline.startDate;
        },
        message: 'End date must be after start date'
      }
    }
  },
  requirements: {
    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      required: [true, 'Experience level is required']
    },
    minimumRating: {
      type: Number,
      min: [1, 'Minimum rating must be between 1 and 5'],
      max: [5, 'Minimum rating must be between 1 and 5']
    },
    portfolioRequired: {
      type: Boolean,
      default: false
    },
    testRequired: {
      type: Boolean,
      default: false
    }
  },
  location: {
    type: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      required: [true, 'Location type is required']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country name cannot exceed 100 characters']
    },
    timezone: {
      type: String,
      trim: true
    }
  },
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [255, 'File name cannot exceed 255 characters']
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true,
      max: [10485760, 'File size cannot exceed 10MB'] // 10MB limit
    },
    type: {
      type: String,
      required: true,
      enum: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif']
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invited'],
    default: 'public'
  },
  proposals: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    received: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal'
    }]
  },
  escrow: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    contractAddress: {
      type: String,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid contract address']
    },
    amount: {
      type: Number,
      min: [0, 'Escrow amount cannot be negative']
    }
  },
  milestones: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Milestone title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Milestone description cannot exceed 500 characters']
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Milestone amount cannot be negative']
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(dueDate: Date) {
          return dueDate > new Date();
        },
        message: 'Milestone due date must be in the future'
      }
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'disputed'],
      default: 'pending'
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  applications: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret: any) {
      // Keep both _id and id for compatibility
      ret.id = ret._id;
      // Don't delete _id - keep it for frontend compatibility
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret: any) {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
JobPostSchema.index({ clientId: 1, status: 1 });
JobPostSchema.index({ status: 1, createdAt: -1 });
JobPostSchema.index({ category: 1, status: 1 });
JobPostSchema.index({ skills: 1, status: 1 });
JobPostSchema.index({ 'budget.amount': 1, status: 1 });
JobPostSchema.index({ featured: 1, status: 1, createdAt: -1 });
JobPostSchema.index({ 'location.type': 1, status: 1 });
JobPostSchema.index({ urgency: 1, status: 1 });

// Text search index for title and description
JobPostSchema.index({
  title: 'text',
  description: 'text',
  skills: 'text',
  tags: 'text'
});

// Virtual for calculating budget range display
JobPostSchema.virtual('budgetDisplay').get(function(this: IJobPost) {
  const { type, amount, currency } = this.budget;
  return `${currency} ${amount}${type === 'hourly' ? '/hr' : ''}`;
});

// Virtual for calculating time remaining
JobPostSchema.virtual('timeRemaining').get(function(this: IJobPost) {
  if (!this.timeline.endDate) return null;
  
  const now = new Date();
  const endDate = new Date(this.timeline.endDate);
  const diffTime = endDate.getTime() - now.getTime();
  
  if (diffTime <= 0) return 'Expired';
  
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
  return `${Math.ceil(diffDays / 30)} months`;
});

// Pre-save middleware to validate skills array
JobPostSchema.pre<IJobPost>('save', function(next) {
  if (this.skills && this.skills.length === 0) {
    return next(new Error('At least one skill is required'));
  }
  
  if (this.skills && this.skills.length > 20) {
    return next(new Error('Cannot have more than 20 skills'));
  }
  
  next();
});

// Pre-save middleware to validate milestones total amount
JobPostSchema.pre<IJobPost>('save', function(next) {
  if (this.milestones && this.milestones.length > 0) {
    const totalMilestoneAmount = this.milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
    if (totalMilestoneAmount > this.budget.amount) {
      return next(new Error('Total milestone amount cannot exceed job budget'));
    }
  }
  next();
});

export default mongoose.model<IJobPost>('JobPost', JobPostSchema);
