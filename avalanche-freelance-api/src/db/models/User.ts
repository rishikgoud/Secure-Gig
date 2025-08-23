import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  address: string;
  name?: string;
  email?: string;
  role: 'CLIENT' | 'FREELANCER' | 'BOTH';
  reputation: number;
  totalEarnings: string; // BigInt as string
  totalSpent: string; // BigInt as string
  completedJobs: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  role: {
    type: String,
    enum: ['CLIENT', 'FREELANCER', 'BOTH'],
    default: 'BOTH'
  },
  reputation: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalEarnings: {
    type: String,
    default: '0'
  },
  totalSpent: {
    type: String,
    default: '0'
  },
  completedJobs: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

UserSchema.index({ address: 1 });
UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
