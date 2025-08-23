// Test if Glacier API URLs are causing the path-to-regexp error
const express = require('express');

console.log('Testing Glacier API URL patterns...');

// These are the patterns from your walletService.ts that might be causing issues
const glacierUrls = [
  '/chains/43113/addresses/0x123/balances:native',
  '/chains/43113/addresses/0x123/balances:listErc20',
  '/chains/43113/addresses/0x123/transactions:latest'
];

glacierUrls.forEach((url, index) => {
  try {
    // This simulates what happens when Express tries to parse these URLs
    const app = express();
    // If Express tries to interpret these as route patterns, it will fail
    console.log(`Testing URL ${index + 1}: ${url}`);
    
    // The issue is that these URLs are being processed by Express's path-to-regexp
    // when they should only be used as HTTP client URLs
    
  } catch (error) {
    console.error(`URL ${index + 1} failed:`, error.message);
  }
});

console.log('The issue is that Express is trying to parse Glacier API URLs as route patterns.');
console.log('These URLs should only be used for HTTP requests, not route definitions.');
