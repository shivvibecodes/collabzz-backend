import { BaseTemplate } from './base.template';
import { OtpPayload } from '../dto/send-email.dto';

export function OtpTemplate(payload: OtpPayload): {
  subject: string;
  html: string;
} {
  const subject = 'Your Collabzz verification code';

  const html = BaseTemplate({
    title: subject,
    previewText: `Your OTP is ${payload.otp} — expires in ${payload.expiresInMinutes} minutes.`,
    content: `
      <h1>Verify your identity</h1>
      <p>Hi ${payload.name},</p>
      <p>Use the code below to complete your verification. It expires in <strong>${payload.expiresInMinutes} minutes</strong>.</p>
      <span class="otp-code">${payload.otp}</span>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  return { subject, html };
}
