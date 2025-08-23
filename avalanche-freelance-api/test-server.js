const express = require('express');

const app = express();

// Test each route module individually
console.log('Testing route imports...');

try {
  console.log('1. Importing chain routes...');
  const { chain } = require('./dist/routes/chain');
  app.use('/api/chain', chain);
  console.log('✓ Chain routes OK');
} catch (error) {
  console.error('✗ Chain routes failed:', error.message);
}

try {
  console.log('2. Importing wallet routes...');
  const { wallet } = require('./dist/routes/wallet');
  app.use('/api/wallet', wallet);
  console.log('✓ Wallet routes OK');
} catch (error) {
  console.error('✗ Wallet routes failed:', error.message);
}

try {
  console.log('3. Importing escrow routes...');
  const { escrow } = require('./dist/routes/escrow');
  app.use('/api/escrow', escrow);
  console.log('✓ Escrow routes OK');
} catch (error) {
  console.error('✗ Escrow routes failed:', error.message);
}

try {
  console.log('4. Importing tx routes...');
  const { tx } = require('./dist/routes/tx');
  app.use('/api/tx', tx);
  console.log('✓ TX routes OK');
} catch (error) {
  console.error('✗ TX routes failed:', error.message);
}

console.log('Route import test complete.');
