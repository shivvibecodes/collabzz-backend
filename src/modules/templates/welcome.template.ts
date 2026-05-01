import { BaseTemplate } from './base.template';
import { WelcomePayload } from '../dto/send-email.dto';

export function WelcomeTemplate(payload: WelcomePayload): {
  subject: string;
  html: string;
} {
  const subject = 'Welcome to Collabzz 🎉';

  const roleMessage =
    payload.role === 'brand'
      ? 'You can now discover top influencers, launch campaigns, and track performance — all in one place.'
      : 'You can now browse brand deals, manage collaborations, and grow your influence — all in one place.';

  const html = BaseTemplate({
    title: subject,
    previewText: `Welcome aboard, ${payload.name}! Your Collabzz account is ready.`,
    content: `
      <h1>Welcome aboard, ${payload.name}!</h1>
      <p>We're thrilled to have you on Collabzz. ${roleMessage}</p>
      <p>Here's what you can do next:</p>
      <div class="meta-box">
        <p>✅ <strong>Complete your profile</strong> — add your details to stand out</p>
        <p>✅ <strong>Explore the platform</strong> — see what's waiting for you</p>
        <p>✅ <strong>Connect</strong> — start building meaningful collaborations</p>
      </div>
      <a class="btn" href="${process.env.FRONTEND_URL}/dashboard">Go to Dashboard</a>
      <p style="font-size:13px;color:#9999aa;">Need help? Reply to this email or visit our support centre.</p>
    `,
  });

  return { subject, html };
}
