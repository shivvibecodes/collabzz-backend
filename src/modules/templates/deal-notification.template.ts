import { BaseTemplate } from './base.template';
import { DealNotificationPayload } from '../dto/send-email.dto';

export function DealNotificationTemplate(payload: DealNotificationPayload): {
  subject: string;
  html: string;
} {
  const subject = `New deal offer: ${payload.dealTitle}`;

  const html = BaseTemplate({
    title: subject,
    previewText: `${payload.brandName} has sent you a deal worth $${payload.dealAmount}.`,
    content: `
      <h1>You've got a new deal offer!</h1>
      <p>Hi ${payload.name},</p>
      <p><strong>${payload.brandName}</strong> has sent you a collaboration offer. Here are the details:</p>
      <div class="meta-box">
        <p><strong>Deal:</strong> ${payload.dealTitle}</p>
        <p><strong>Brand:</strong> ${payload.brandName}</p>
        <p><strong>Offered Amount:</strong> $${payload.dealAmount.toLocaleString()}</p>
      </div>
      <p>Review the full offer and respond before it expires.</p>
      <a class="btn" href="${payload.actionUrl}">View Deal</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#9999aa;">If you're not interested, you can decline from your dashboard.</p>
    `,
  });

  return { subject, html };
}
