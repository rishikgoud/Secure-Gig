const express = require('express');

// Test minimal server to isolate the issue
const app = express();

console.log('Testing route definitions...');

// Test 1: Basic route
try {
  app.get('/test', (req, res) => res.json({ok: true}));
  console.log('✓ Basic route OK');
} catch (e) {
  console.error('✗ Basic route failed:', e.message);
}

// Test 2: Route with parameter
try {
  app.get('/test/:id', (req, res) => res.json({id: req.params.id}));
  console.log('✓ Parameter route OK');
} catch (e) {
  console.error('✗ Parameter route failed:', e.message);
}

// Test 3: Route with multiple parameters
try {
  app.get('/test/:id/sub/:subId', (req, res) => res.json({id: req.params.id, subId: req.params.subId}));
  console.log('✓ Multiple parameter route OK');
} catch (e) {
  console.error('✗ Multiple parameter route failed:', e.message);
}

// Test 4: Problematic patterns that could cause the error
const problematicRoutes = [
  '/test/:',           // Missing parameter name
  '/test/:/sub',       // Missing parameter name with continuation
  '/test/:id:',        // Invalid character after parameter
  '/test/:id/',        // Valid route
];

problematicRoutes.forEach((route, index) => {
  try {
    const testApp = express();
    testApp.get(route, (req, res) => res.json({ok: true}));
    console.log(`✓ Route ${index + 1} (${route}) OK`);
  } catch (e) {
    console.error(`✗ Route ${index + 1} (${route}) failed:`, e.message);
  }
});

console.log('Route testing complete.');
