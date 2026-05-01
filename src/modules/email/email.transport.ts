import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  messageId: string;
}

interface BrevoSendResponse {
  messageId?: string;
}

interface BrevoErrorResponse {
  message?: string;
  code?: string;
}

@Injectable()
export class EmailTransport {
  private readonly logger = new Logger(EmailTransport.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.getOrThrow<string>('BREVO_API_KEY');
    this.senderEmail = this.config.getOrThrow<string>('BREVO_SENDER_EMAIL');
    this.senderName = this.config.get<string>('BREVO_SENDER_NAME', 'Collabzz');
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const { to, subject, html } = options;

    try {
      const response = await axios.post<BrevoSendResponse>(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: this.senderName, email: this.senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      const messageId: string | undefined = response.data?.messageId;
      if (!messageId) {
        this.logger.warn(
          `Brevo response missing messageId for ${to}. Response: ${JSON.stringify(response.data)}`,
        );
      }

      const resolvedId = messageId ?? `brevo-fallback-${Date.now()}`;
      this.logger.log(`Email sent to ${to} | messageId: ${resolvedId}`);
      return { messageId: resolvedId };
    } catch (error: unknown) {
      if (axios.isAxiosError<BrevoErrorResponse>(error)) {
        const axiosError: AxiosError<BrevoErrorResponse> = error;
        const brevoMessage =
          axiosError.response?.data?.message ?? axiosError.message;
        const statusCode = axiosError.response?.status;
        this.logger.error(
          `Brevo API error [${statusCode}] for ${to}: ${brevoMessage}`,
        );
      } else {
        this.logger.error(`Unexpected error sending email to ${to}:`, error);
      }
      throw error;
    }
  }
}
