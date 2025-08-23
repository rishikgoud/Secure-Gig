import mongoose, { Document, Schema } from 'mongoose';

export interface IDispute extends Document {
  jobId: number;
  opener: string; // address who opened the dispute
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  resolvedBy?: string; // arbitrator address
  resolutionTx?: string;
  evidence: {
    submittedBy: string;
    content: string;
    timestamp: Date;
    ipfsHash?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>({
  jobId: {
    type: Number,
    required: true,
    min: 0
  },
  opener: {
    type: String,
    required: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  resolvedBy: {
    type: String,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  resolutionTx: {
    type: String,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{64}$/
  },
  evidence: [{
    submittedBy: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipfsHash: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

DisputeSchema.index({ jobId: 1 });
DisputeSchema.index({ opener: 1 });
DisputeSchema.index({ status: 1 });
DisputeSchema.index({ createdAt: -1 });

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);
