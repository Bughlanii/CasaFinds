/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory server store for OAuth and cron simulation
let serverTokens = {
  access_token: 'pina_oautha_live_sample_token_3f9b',
  refresh_token: 'pinr_oauthr_live_sample_token_8a2c',
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  last_refreshed: new Date().toISOString(),
  tier: 'standard', // 'trial' | 'standard'
  scope: ['boards:read', 'pins:read', 'pins:write', 'user_accounts:read'],
};

// API: Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    account: 'casafinds',
    tier: serverTokens.tier,
    token_valid: true,
    expires_at: serverTokens.expires_at,
    last_refreshed: serverTokens.last_refreshed,
    server_time: new Date().toISOString(),
  });
});

// API: OAuth Connect URL (FR-01)
app.get('/api/auth/oauth-url', (req, res) => {
  const clientId = process.env.PINTEREST_APP_ID || '1498302';
  const redirectUri = process.env.PINTEREST_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/callback`;
  const state = Math.random().toString(36).substring(2, 15);
  const scopes = 'boards:read,pins:read,pins:write,user_accounts:read';

  const oauthUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scopes}&state=${state}`;

  res.json({ oauth_url: oauthUrl, state, redirect_uri: redirectUri });
});

// API: OAuth Callback (FR-01)
app.get('/api/auth/callback', (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`
      <html>
        <body style="font-family:sans-serif;padding:40px;background:#fef2f2;color:#991b1b">
          <h2>Pinterest OAuth Error</h2>
          <p>${error}: ${error_description || 'Authorization declined by user'}</p>
          <a href="/" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#b91c1c;color:white;text-decoration:none;border-radius:6px">Return to Dashboard</a>
        </body>
      </html>
    `);
  }

  // Rotate tokens
  serverTokens.access_token = 'pina_oautha_' + Math.random().toString(36).substring(2, 14);
  serverTokens.refresh_token = 'pinr_oauthr_' + Math.random().toString(36).substring(2, 14);
  serverTokens.last_refreshed = new Date().toISOString();
  serverTokens.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  res.send(`
    <html>
      <body style="font-family:sans-serif;padding:40px;background:#f0fdf4;color:#166534">
        <h2>Pinterest Business Account Connected!</h2>
        <p>Authorization code received and exchanged successfully. Returning to CasaFinds Auto-Poster...</p>
        <script>
          setTimeout(() => { window.location.href = '/?auth_success=1'; }, 1500);
        </script>
      </body>
    </html>
  `);
});

// API: Token Refresh (FR-09)
app.post('/api/auth/refresh', (req, res) => {
  serverTokens.access_token = 'pina_oautha_' + Math.random().toString(36).substring(2, 14);
  serverTokens.refresh_token = 'pinr_oauthr_' + Math.random().toString(36).substring(2, 14);
  serverTokens.last_refreshed = new Date().toISOString();
  serverTokens.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  res.json({
    success: true,
    message: 'Pinterest OAuth access token refreshed and refresh token rotated successfully.',
    expires_at: serverTokens.expires_at,
    last_refreshed: serverTokens.last_refreshed,
  });
});

// Static or Vite setup
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CasaFinds Pinterest Auto-Poster running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
