import { z } from 'zod';

const integerFromEnv = z.coerce.number().int();

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: integerFromEnv.min(1).max(65535).default(3000),
  API_PREFIX: z.string().default('api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  MONGODB_URI: z.string().min(1),

  THROTTLE_TTL_SECONDS: integerFromEnv.min(1).default(60),
  THROTTLE_LIMIT: integerFromEnv.min(1).default(120),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
