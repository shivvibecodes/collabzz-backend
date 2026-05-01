import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailLog,
  EmailLogDocument,
  EmailStatus,
} from '../schemas/email-log.schema';
import { EmailJobPayload } from '../dto/send-email.dto';

@Injectable()
export class EmailLogService {
  private readonly logger = new Logger(EmailLogService.name);

  constructor(
    @InjectModel(EmailLog.name)
    private readonly emailLogModel: Model<EmailLogDocument>,
  ) {}

  async createPending(
    payload: EmailJobPayload,
    subject: string,
  ): Promise<EmailLogDocument> {
    const log = new this.emailLogModel({
      to: payload.to,
      subject,
      type: payload.type,
      payload,
      status: EmailStatus.Pending,
    });
    return log.save();
  }

  async upsertPending(
    jobId: string,
    payload: EmailJobPayload,
    subject: string,
  ): Promise<EmailLogDocument> {
    const doc = await this.emailLogModel.findOneAndUpdate(
      { jobId },
      {
        $set: {
          to: payload.to,
          subject,
          type: payload.type,
          payload,
          status: EmailStatus.Pending,
          errorMessage: null,
        },
        $setOnInsert: { jobId },
      },
      { upsert: true, new: true },
    );
    return doc;
  }

  async createFailed(
    payload: EmailJobPayload,
    errorMessage: string,
  ): Promise<EmailLogDocument> {
    const log = new this.emailLogModel({
      to: payload.to,
      subject: '(unknown — template resolution failed)',
      type: payload.type,
      payload,
      status: EmailStatus.Failed,
      errorMessage,
    });
    return log.save();
  }

  async markSent(id: string, messageId: string): Promise<void> {
    await this.emailLogModel.findByIdAndUpdate(id, {
      status: EmailStatus.Sent,
      messageId,
      sentAt: new Date(),
    });
  }

  async markFailed(id: string, errorMessage: string): Promise<void> {
    await this.emailLogModel.findByIdAndUpdate(id, {
      status: EmailStatus.Failed,
      errorMessage,
    });
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ data: EmailLogDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.emailLogModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.emailLogModel.countDocuments().exec(),
    ]);
    return { data, total };
  }

  async findByEmail(email: string): Promise<EmailLogDocument[]> {
    return this.emailLogModel
      .find({ to: email })
      .sort({ createdAt: -1 })
      .exec();
  }
}
