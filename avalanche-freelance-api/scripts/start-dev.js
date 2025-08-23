#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Avalanche Freelance API in development mode...\n');

// Check if .env file exists
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Please copy and configure your environment variables.');
  console.log('📋 Required variables:');
  console.log('   - MONGO_URI');
  console.log('   - AVAX_CHAIN_ID');
  console.log('   - AVAX_RPC_HTTP');
  console.log('   - ESCROW_ADDRESS');
  console.log('   - GLACIER_API_KEY');
  process.exit(1);
}

// Start the development server
const child = spawn('npx', ['ts-node-dev', '--respawn', '--transpile-only', 'src/server.ts'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

child.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

child.on('exit', (code) => {
  console.log(`\n📊 Server exited with code ${code}`);
});
