import { BaseTemplate } from './base.template';
import { ContractReminderPayload } from '../dto/send-email.dto';

export function ContractReminderTemplate(payload: ContractReminderPayload): {
  subject: string;
  html: string;
} {
  const subject = `Reminder: "${payload.contractTitle}" is due soon`;

  const formattedDate = new Date(payload.dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = BaseTemplate({
    title: subject,
    previewText: `Your contract "${payload.contractTitle}" is due on ${formattedDate}.`,
    content: `
      <h1>Contract Reminder</h1>
      <p>Hi ${payload.name},</p>
      <p>This is a reminder that the following contract requires your attention:</p>
      <div class="meta-box">
        <p><strong>Contract:</strong> ${payload.contractTitle}</p>
        <p><strong>Due Date:</strong> ${formattedDate}</p>
      </div>
      <p>Please review and sign the contract before the deadline to avoid any delays.</p>
      <a class="btn" href="${payload.actionUrl}">Review Contract</a>
      <hr class="divider" />
      <p style="font-size:13px;color:#9999aa;">If you've already signed this contract, please disregard this email.</p>
    `,
  });

  return { subject, html };
}
