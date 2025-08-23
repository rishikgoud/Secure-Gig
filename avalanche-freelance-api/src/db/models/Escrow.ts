import mongoose, { Document, Schema } from 'mongoose';

export interface IEscrow extends Document {
  jobId: number;
  client: string;
  freelancer: string;
  token: string;
  amount: string; // BigInt as string
  depositTx: string;
  state: 'PENDING' | 'LOCKED' | 'RELEASED' | 'DISPUTED' | 'RESOLVED';
  events: {
    type: 'DEPOSITED' | 'RELEASED' | 'DISPUTED' | 'RESOLVED';
    txHash: string;
    blockNumber: number;
    timestamp: Date;
    data?: any;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const EscrowSchema = new Schema<IEscrow>({
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
    required: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
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
  depositTx: {
    type: String,
    required: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{64}$/
  },
  state: {
    type: String,
    enum: ['PENDING', 'LOCKED', 'RELEASED', 'DISPUTED', 'RESOLVED'],
    default: 'PENDING'
  },
  events: [{
    type: {
      type: String,
      enum: ['DEPOSITED', 'RELEASED', 'DISPUTED', 'RESOLVED'],
      required: true
    },
    txHash: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{64}$/
    },
    blockNumber: {
      type: Number,
      required: true,
      min: 0
    },
    timestamp: {
      type: Date,
      required: true
    },
    data: Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

EscrowSchema.index({ jobId: 1 });
EscrowSchema.index({ client: 1 });
EscrowSchema.index({ freelancer: 1 });
EscrowSchema.index({ state: 1 });

export const Escrow = mongoose.model<IEscrow>('Escrow', EscrowSchema);
