import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),
  MONGO_URI: z.string().default('mongodb://localhost:27017/ava-freelance'),
  AVAX_CHAIN_ID: z.string().default('43113').transform(Number),
  AVAX_RPC_HTTP: z.string().url().default('https://api.avax-test.network/ext/bc/C/rpc'),
  AVAX_RPC_WS: z.string().url().default('wss://api.avax-test.network/ext/bc/C/ws'),
  ESCROW_ADDRESS: z.string().default('0x0000000000000000000000000000000000000000'),
  RELAYER_PK: z.string().optional(),
  GLACIER_API_KEY: z.string().default('your_avacloud_key'),
  GLACIER_BASE: z.string().url().default('https://glacier-api.avax.network'),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('Environment validation failed:', error);
  console.error('Please check your .env file for missing or invalid values');
  process.exit(1);
}

export { env };
