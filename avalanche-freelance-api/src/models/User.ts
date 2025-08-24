import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'client' | 'freelancer';
  walletAddress?: string;
  profile: {
    bio?: string;
    skills?: string[];
    hourlyRate?: number;
    location?: string;
    website?: string;
    avatar?: string;
    portfolio?: {
      title: string;
      description: string;
      url: string;
      image?: string;
    }[];
    experience?: {
      company: string;
      position: string;
      startDate: Date;
      endDate?: Date;
      description: string;
    }[];
    education?: {
      institution: string;
      degree: string;
      field: string;
      startDate: Date;
      endDate?: Date;
    }[];
  };
  ratings: {
    average: number;
    count: number;
    reviews: {
      reviewerId: mongoose.Types.ObjectId;
      rating: number;
      comment: string;
      createdAt: Date;
    }[];
  };
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['client', 'freelancer'],
    required: [true, 'Role is required']
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid Ethereum wallet address']
  },
  profile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    skills: [{
      type: String,
      trim: true
    }],
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    },
    avatar: {
      type: String,
      trim: true
    },
    portfolio: [{
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Portfolio title cannot exceed 100 characters']
      },
      description: {
        type: String,
        required: true,
        maxlength: [500, 'Portfolio description cannot exceed 500 characters']
      },
      url: {
        type: String,
        required: true,
        match: [/^https?:\/\/.+/, 'Please enter a valid URL']
      },
      image: {
        type: String,
        trim: true
      }
    }],
    experience: [{
      company: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
      },
      position: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Position cannot exceed 100 characters']
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        validate: {
          validator: function(this: any, endDate: Date) {
            return !endDate || endDate > this.startDate;
          },
          message: 'End date must be after start date'
        }
      },
      description: {
        type: String,
        maxlength: [500, 'Experience description cannot exceed 500 characters']
      }
    }],
    education: [{
      institution: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Institution name cannot exceed 100 characters']
      },
      degree: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Degree cannot exceed 100 characters']
      },
      field: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Field of study cannot exceed 100 characters']
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        validate: {
          validator: function(this: any, endDate: Date) {
            return !endDate || endDate > this.startDate;
          },
          message: 'End date must be after start date'
        }
      }
    }]
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    reviews: [{
      reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: [500, 'Review comment cannot exceed 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'profile.skills': 1 });
UserSchema.index({ 'ratings.average': -1 });

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update ratings average when reviews change
UserSchema.pre<IUser>('save', function(next) {
  if (this.isModified('ratings.reviews')) {
    const reviews = this.ratings.reviews;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      this.ratings.average = sum / reviews.length;
      this.ratings.count = reviews.length;
    } else {
      this.ratings.average = 0;
      this.ratings.count = 0;
    }
  }
  next();
});

export default mongoose.model<IUser>('User', UserSchema);
