import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailJobPayload } from '../dto/send-email.dto';
import { EmailTransport } from './email.transport';
import { EmailLogService } from './email.log.service';
import { OtpTemplate } from '../templates/otp.template';
import { WelcomeTemplate } from '../templates/welcome.template';
import { DealNotificationTemplate } from '../templates/deal-notification.template';
import { PaymentReceiptTemplate } from '../templates/payment-receipt.template';
import { ContractReminderTemplate } from '../templates/contract-reminder.template';

@Injectable()
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly transport: EmailTransport,
    private readonly logService: EmailLogService,
  ) {}

  @OnEvent('email.send', { async: true })
  async handleEmailEvent(payload: EmailJobPayload & { jobId: string }): Promise<void> {
    this.logger.log(
      `Processing email event [${payload.type}] for ${payload.to}`,
    );

    let subject: string;
    let html: string;

    try {
      ({ subject, html } = this.resolveTemplate(payload));
    } catch {
      this.logger.error(
        `Unknown email type [${payload.type}]`,
      );
      await this.logService.createFailed(
        payload,
        `Unknown email type: ${payload.type}`,
      );
      return;
    }

    const log = await this.logService.upsertPending(payload.jobId, payload, subject);

    try {
      const result = await this.transport.send({
        to: payload.to,
        subject,
        html,
      });
      await this.logService.markSent(String(log._id), result.messageId);
      this.logger.log(`Email [${payload.type}] sent to ${payload.to}`);
    } catch (error: unknown) {
      const message: string =
        (error instanceof Error ? error.message : null) ??
        (typeof error === 'object' && error !== null && 'response' in error
          ? JSON.stringify((error as { response: unknown }).response)
          : null) ??
        String(error);

      await this.logService.markFailed(String(log._id), message);
      this.logger.error(
        `Email [${payload.type}] failed for ${payload.to}: ${message}`,
      );
      throw error;
    }
  }

  private resolveTemplate(payload: EmailJobPayload): {
    subject: string;
    html: string;
  } {
    switch (payload.type) {
      case 'otp':
        return OtpTemplate(payload);
      case 'welcome':
        return WelcomeTemplate(payload);
      case 'deal-notification':
        return DealNotificationTemplate(payload);
      case 'payment-receipt':
        return PaymentReceiptTemplate(payload);
      case 'contract-reminder':
        return ContractReminderTemplate(payload);
      default:
        throw new Error(
          `Unknown email job type: ${String((payload as Record<string, unknown>).type)}`,
        );
    }
  }
}
