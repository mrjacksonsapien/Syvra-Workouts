import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  // Comma-separated list of allowed browser origins, e.g. "https://a.app,http://localhost:5173".
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

// Takes the variables as a parameter (instead of reading process.env directly) so it can be tested.
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid environment variables:\n  ${problems.join('\n  ')}`);
  }
  return result.data;
}
