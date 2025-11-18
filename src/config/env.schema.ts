import { z } from 'zod';
import { config } from 'dotenv';
config();

const envSchema = z.object({
  GOOGLE_AI_API_KEY: z
    .string()
    .trim()
    .nonempty('GOOGLE_AI_API_KEY is required.'),
  GOOGLE_AI_MODELS_API: z
    .string()
    .trim()
    .nonempty('GOOGLE_AI_MODELS_API is required.'),
  MODEL: z.string().trim().nonempty('MODEL is required.'),
});

type envType = z.infer<typeof envSchema>;

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('❌ Config validation error:', envParsed.error);
  throw new Error('Invalid environment variables');
}

export const env: envType = {
  GOOGLE_AI_API_KEY: envParsed.data.GOOGLE_AI_API_KEY,
  GOOGLE_AI_MODELS_API: envParsed.data.GOOGLE_AI_MODELS_API,
  MODEL: envParsed.data.MODEL,
};
