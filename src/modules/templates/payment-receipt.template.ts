import { BaseTemplate } from './base.template';
import { PaymentReceiptPayload } from '../dto/send-email.dto';

export function PaymentReceiptTemplate(payload: PaymentReceiptPayload): {
  subject: string;
  html: string;
} {
  const subject = `Payment receipt — ${payload.currency.toUpperCase()} ${payload.amount}`;

  const formattedDate = new Date(payload.paidAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = BaseTemplate({
    title: subject,
    previewText: `Your payment of ${payload.currency.toUpperCase()} ${payload.amount} was successful.`,
    content: `
      <h1>Payment Confirmed</h1>
      <p>Hi ${payload.name},</p>
      <p>Your payment was processed successfully. Here's your receipt:</p>
      <div class="meta-box">
        <p><strong>Amount:</strong> ${payload.currency.toUpperCase()} ${payload.amount.toLocaleString()}</p>
        <p><strong>Description:</strong> ${payload.description}</p>
        <p><strong>Transaction ID:</strong> <code style="font-size:13px;background:#eee;padding:2px 6px;border-radius:4px;">${payload.transactionId}</code></p>
        <p><strong>Date:</strong> ${formattedDate}</p>
      </div>
      <p>Keep this email as your proof of payment.</p>
      <hr class="divider" />
      <p style="font-size:13px;color:#9999aa;">Questions about this payment? Contact our support team.</p>
    `,
  });

  return { subject, html };
}
