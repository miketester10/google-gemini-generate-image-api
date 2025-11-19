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

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error(
    '❌ Config validation error:',
    z.treeifyError(envParsed.error).properties,
  );
  throw new Error('Invalid environment variables');
}

type envType = z.infer<typeof envSchema>;
export const env: envType = envParsed.data;
