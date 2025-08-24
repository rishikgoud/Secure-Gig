import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables early - before any other imports
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(Number),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required and cannot be empty'),
  AVAX_CHAIN_ID: z.string().default('43113').transform(Number),
  AVAX_RPC_HTTP: z.string().url().default('https://api.avax-test.network/ext/bc/C/rpc'),
  AVAX_RPC_WS: z.string().url().default('wss://api.avax-test.network/ext/bc/C/ws'),
  ESCROW_ADDRESS: z.string().default('0xYourEscrowOnFuji'),
  RELAYER_PK: z.string().optional(),
  GLACIER_API_KEY: z.string().default('xyz'),
  GLACIER_BASE: z.string().url().default('https://glacier-api.avax.network'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required and cannot be empty'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_COOKIE_EXPIRES_IN: z.string().default('7').transform(Number),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
  console.log('✅ Environment variables loaded successfully');
} catch (error) {
  console.error('❌ Environment validation failed:');
  
  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      console.error(`  • ${err.path.join('.')}: ${err.message}`);
    });
  } else {
    console.error('  • Unexpected error:', error);
  }
  
  console.error('\n💡 Please check your .env file and ensure all required variables are set:');
  console.error('  • MONGODB_URI (complete connection string with credentials)');
  console.error('  • JWT_SECRET (secure random string)');
  console.error('  • Other required environment variables');
  
  process.exit(1);
}

export { env };
