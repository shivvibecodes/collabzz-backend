import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailLogService } from './email.log.service';
import {
  EmailJobPayload,
  OtpPayload,
  WelcomePayload,
  DealNotificationPayload,
  PaymentReceiptPayload,
  ContractReminderPayload,
} from '../dto/send-email.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly emailLogService: EmailLogService,
  ) {}

  async sendEmail(payload: EmailJobPayload): Promise<void> {
    try {
      const jobId = randomUUID();
      this.eventEmitter.emit('email.send', { ...payload, jobId });
      this.logger.log(
        `Email job [${jobId}] queued → type: ${payload.type}, to: ${payload.to}`,
      );
    } catch (error) {
      const message = this.extractMessage(error);
      await this.emailLogService.createFailed(payload, message);
      this.logger.error(`Failed to queue email for ${payload.to}: ${message}`);
      throw error;
    }
  }

  async sendOtp(payload: Omit<OtpPayload, 'type'>): Promise<void> {
    return this.sendEmail({ ...payload, type: 'otp' });
  }

  async sendWelcome(payload: Omit<WelcomePayload, 'type'>): Promise<void> {
    return this.sendEmail({ ...payload, type: 'welcome' });
  }

  async sendDealNotification(
    payload: Omit<DealNotificationPayload, 'type'>,
  ): Promise<void> {
    return this.sendEmail({ ...payload, type: 'deal-notification' });
  }

  async sendPaymentReceipt(
    payload: Omit<PaymentReceiptPayload, 'type'>,
  ): Promise<void> {
    return this.sendEmail({ ...payload, type: 'payment-receipt' });
  }

  async sendContractReminder(
    payload: Omit<ContractReminderPayload, 'type'>,
  ): Promise<void> {
    return this.sendEmail({ ...payload, type: 'contract-reminder' });
  }

  async scheduleEmail(payload: EmailJobPayload, delay: number): Promise<void> {
    try {
      const jobId = randomUUID();
      setTimeout(() => {
        this.eventEmitter.emit('email.send', { ...payload, jobId });
      }, delay);
      this.logger.log(
        `Scheduled email job [${jobId}] → type: ${payload.type}, to: ${payload.to}, delay: ${delay}ms`,
      );
    } catch (error) {
      const message = this.extractMessage(error);
      await this.emailLogService.createFailed(payload, message);
      this.logger.error(
        `Failed to schedule email for ${payload.to}: ${message}`,
      );
      throw error;
    }
  }

  async getEmailLogs(page = 1, limit = 20) {
    return this.emailLogService.findAll(page, limit);
  }

  async getEmailLogsByRecipient(email: string) {
    return this.emailLogService.findByEmail(email);
  }

  private extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null)
      return JSON.stringify(error);
    return String(error);
  }
}
