import mongoose, { Schema, Document } from 'mongoose';

export interface IWaitlist extends Document {
  type: 'brand' | 'influencer';
  fullName: string;
  email: string;
  companyName?: string;
  budget?: string;
  platform?: string;
  followers?: string;
  referrer?: string;
  ipAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistSchema: Schema = new Schema(
  {
    type: { type: String, required: true, enum: ['brand', 'influencer'] },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    companyName: { type: String },
    budget: {
      type: String,
      enum: ['Under ₹25K', '₹25K – ₹1L', '₹1L – ₹5L', '₹5L+'],
    },
    platform: { type: String, enum: ['Instagram', 'YouTube', 'Both', 'Other'] },
    followers: {
      type: String,
      enum: ['Under 10K', '10K – 100K', '100K – 500K', '500K+'],
    },
    referrer: { type: String },
    ipAddress: { type: String, required: true },
  },
  { timestamps: true, collection: 'waitlist' },
);

export const Waitlist = mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);
