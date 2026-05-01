export type EmailJobType =
  | 'otp'
  | 'welcome'
  | 'deal-notification'
  | 'payment-receipt'
  | 'contract-reminder';

export interface OtpPayload {
  type: 'otp';
  to: string;
  name: string;
  otp: string;
  expiresInMinutes: number;
}

export interface WelcomePayload {
  type: 'welcome';
  to: string;
  name: string;
  role: 'influencer' | 'brand';
}

export interface DealNotificationPayload {
  type: 'deal-notification';
  to: string;
  name: string;
  dealTitle: string;
  dealAmount: number;
  brandName: string;
  actionUrl: string;
}

export interface PaymentReceiptPayload {
  type: 'payment-receipt';
  to: string;
  name: string;
  amount: number;
  currency: string;
  transactionId: string;
  description: string;
  paidAt: string | Date;
}

export interface ContractReminderPayload {
  type: 'contract-reminder';
  to: string;
  name: string;
  contractTitle: string;
  dueDate: string | Date;
  actionUrl: string;
}

export type EmailJobPayload =
  | OtpPayload
  | WelcomePayload
  | DealNotificationPayload
  | PaymentReceiptPayload
  | ContractReminderPayload;
