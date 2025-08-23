const express = require('express');

const app = express();

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Simple server working' });
});

const port = 4001;
app.listen(port, () => {
  console.log(`✅ Simple test server running on port ${port}`);
  console.log(`Test: http://localhost:${port}/health`);
});
