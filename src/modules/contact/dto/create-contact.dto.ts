import { z } from 'zod';

export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Brand', 'Influencer', 'Investor', 'Press', 'Other']),
  message: z.string().min(1, 'Message is required'),
});

export type CreateContactDto = z.infer<typeof createContactSchema>;
