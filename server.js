require('dotenv').config();
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,            // max 120 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Serve client-side environment config (public vars only — no secrets)
app.get('/env-config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(
    `window.__ENV__ = ${JSON.stringify({
      ENTRA_CLIENT_ID:    process.env.ENTRA_CLIENT_ID    || '',
      ENTRA_TENANT_ID:    process.env.ENTRA_TENANT_ID    || '',
      ENTRA_API_SCOPES:   process.env.ENTRA_API_SCOPES   || '',
      AGENT_API_ENDPOINT: process.env.AGENT_API_ENDPOINT || '',
    })};`
  );
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route for SPA deep-link support
app.get('*', limiter, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI Agent Frontend running on port ${PORT}`);
});
