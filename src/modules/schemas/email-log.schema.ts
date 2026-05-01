import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EmailLogDocument = HydratedDocument<EmailLog>;

export enum EmailStatus {
  Pending = 'pending',
  Sent = 'sent',
  Failed = 'failed',
}

@Schema({ timestamps: true, collection: 'email_logs' })
export class EmailLog {
  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true, enum: EmailStatus, default: EmailStatus.Pending })
  status: EmailStatus;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Object })
  payload: Record<string, any>;

  @Prop({ index: true, sparse: true, unique: true })
  jobId?: string;

  @Prop()
  messageId?: string;

  @Prop()
  errorMessage?: string;

  @Prop()
  sentAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const EmailLogSchema = SchemaFactory.createForClass(EmailLog);
