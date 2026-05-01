import { z } from 'zod';

const commonFields = {
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  referrer: z.string().nullish(),
};

const brandSchema = z.object({
  type: z.literal('brand'),
  companyName: z.string().min(1, 'Company name is required'),
  budget: z.enum(['Under ₹25K', '₹25K – ₹1L', '₹1L – ₹5L', '₹5L+']),
  ...commonFields,
});

const influencerSchema = z.object({
  type: z.literal('influencer'),
  platform: z.enum(['Instagram', 'YouTube', 'Both', 'Other']),
  followers: z.enum(['Under 10K', '10K – 100K', '100K – 500K', '500K+']),
  ...commonFields,
});

export const submitWaitlistSchema = z.discriminatedUnion('type', [
  brandSchema,
  influencerSchema,
]);

export type SubmitWaitlistDto = z.infer<typeof submitWaitlistSchema>;
