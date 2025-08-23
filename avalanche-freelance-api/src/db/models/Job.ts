import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  jobId: number;
  client: string;
  freelancer?: string;
  title: string;
  description: string;
  token: string;
  amount: string; // BigInt as string
  status: 'OPEN' | 'LOCKED' | 'SUBMITTED' | 'RELEASED' | 'DISPUTED' | 'RESOLVED';
  escrowTxHash?: string;
  releaseTxHash?: string;
  disputeTxHash?: string;
  deadline?: Date;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>({
  jobId: {
    type: Number,
    required: true,
    unique: true,
    min: 0
  },
  client: {
    type: String,
    required: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  freelancer: {
    type: String,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  token: {
    type: String,
    required: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  amount: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'LOCKED', 'SUBMITTED', 'RELEASED', 'DISPUTED', 'RESOLVED'],
    default: 'OPEN'
  },
  escrowTxHash: {
    type: String,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{64}$/
  },
  releaseTxHash: {
    type: String,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{64}$/
  },
  disputeTxHash: {
    type: String,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{64}$/
  },
  deadline: {
    type: Date
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: 50
  }]
}, {
  timestamps: true
});

JobSchema.index({ jobId: 1 });
JobSchema.index({ client: 1 });
JobSchema.index({ freelancer: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ createdAt: -1 });

export const Job = mongoose.model<IJob>('Job', JobSchema);
