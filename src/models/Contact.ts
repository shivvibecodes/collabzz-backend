import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  role: 'Brand' | 'Influencer' | 'Investor' | 'Press' | 'Other';
  message: string;
  ipAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['Brand', 'Influencer', 'Investor', 'Press', 'Other'],
    },
    message: { type: String, required: true },
    ipAddress: { type: String, required: true },
  },
  { timestamps: true, collection: 'contacts' },
);

export const Contact = mongoose.model<IContact>('Contact', ContactSchema);
