import { z } from 'zod';

export const createUploadUrlSchema = z.object({
  key: z.string().min(3).max(256),
  contentType: z.string().min(3).max(128),
});

export type CreateUploadUrlInput = z.infer<typeof createUploadUrlSchema>;
