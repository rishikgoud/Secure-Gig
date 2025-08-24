import mongoose, { Schema, Document } from 'mongoose';

export interface IProposal extends Document {
  jobId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  coverLetter: string;
  proposedRate: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  timeline: {
    duration: number;
    unit: 'days' | 'weeks' | 'months';
    startDate?: Date;
  };
  experience: string;
  portfolioLinks: string[];
  attachments?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'shortlisted';
  submittedAt: Date;
  updatedAt: Date;
  clientResponse?: {
    message: string;
    respondedAt: Date;
  };
  isActive: boolean;
}

const ProposalSchema: Schema = new Schema({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'JobPost',
    required: true,
    index: true
  },
  freelancerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  coverLetter: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 2000,
    trim: true
  },
  proposedRate: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      enum: ['USD', 'AVAX', 'ETH'],
      default: 'USD'
    },
    type: {
      type: String,
      required: true,
      enum: ['fixed', 'hourly']
    }
  },
  timeline: {
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      required: true,
      enum: ['days', 'weeks', 'months']
    },
    startDate: {
      type: Date
    }
  },
  experience: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 1000,
    trim: true
  },
  portfolioLinks: [{
    type: String,
    validate: {
      validator: function(url: string) {
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Portfolio links must be valid URLs'
    }
  }],
  attachments: [{
    type: String,
    maxlength: 500
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'shortlisted'],
    default: 'pending',
    index: true
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  clientResponse: {
    message: {
      type: String,
      maxlength: 500
    },
    respondedAt: {
      type: Date
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret: any) {
      // Keep both _id and id for compatibility
      ret.id = ret._id;
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

// Compound indexes for efficient queries
ProposalSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });
ProposalSchema.index({ jobId: 1, status: 1, submittedAt: -1 });
ProposalSchema.index({ freelancerId: 1, status: 1, submittedAt: -1 });

// Update the updatedAt field on save
ProposalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for populated job details
ProposalSchema.virtual('job', {
  ref: 'JobPost',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

// Virtual for populated freelancer details
ProposalSchema.virtual('freelancer', {
  ref: 'User',
  localField: 'freelancerId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON output
ProposalSchema.set('toJSON', { virtuals: true });
ProposalSchema.set('toObject', { virtuals: true });

export const Proposal = mongoose.model<IProposal>('Proposal', ProposalSchema);
