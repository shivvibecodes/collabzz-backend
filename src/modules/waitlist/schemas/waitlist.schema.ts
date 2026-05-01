import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'waitlist' })
export class Waitlist extends Document {
  @Prop({ required: true, enum: ['brand', 'influencer'] })
  type: 'brand' | 'influencer';

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, index: true, unique: true })
  email: string;

  // Brand specific
  @Prop()
  companyName?: string;

  @Prop({ enum: ['Under ₹25K', '₹25K – ₹1L', '₹1L – ₹5L', '₹5L+'] })
  budget?: string;

  // Influencer specific
  @Prop({ enum: ['Instagram', 'YouTube', 'Both', 'Other'] })
  platform?: string;

  @Prop({ enum: ['Under 10K', '10K – 100K', '100K – 500K', '500K+'] })
  followers?: string;

  @Prop()
  referrer?: string;

  @Prop({ required: true })
  ipAddress: string;
}

export const WaitlistSchema = SchemaFactory.createForClass(Waitlist);
