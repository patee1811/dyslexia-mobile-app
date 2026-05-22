const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function loadDotEnv() {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');

    if (equalsIndex < 0) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^["']|["']$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8081';
const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL || `http://localhost:${PORT}`;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || `${BACKEND_PUBLIC_URL}/api/auth/google/callback`;

const states = new Map();
const sessions = new Map();

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(body);
}

function redirect(res, location) {
  res.writeHead(302, {
    Location: location,
    'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
  });
  res.end();
}

function randomToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function cleanExpiredState() {
  const now = Date.now();

  for (const [state, createdAt] of states.entries()) {
    if (now - createdAt > 10 * 60 * 1000) {
      states.delete(state);
    }
  }
}

function frontendRedirect(params) {
  const url = new URL(FRONTEND_ORIGIN);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Google token exchange failed: ${response.status} ${errorText.slice(0, 120)}`);
  }

  return response.json();
}

async function fetchGoogleUser(accessToken) {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Google userinfo failed: ${response.status}`);
  }

  const profile = await response.json();

  return {
    id: profile.sub,
    email: profile.email,
    name: profile.name || profile.email,
    picture: profile.picture,
  };
}

function authHeaderToken(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1];
}

async function handleRequest(req, res) {
  const url = new URL(req.url || '/', BACKEND_PUBLIC_URL);

  if (req.method === 'OPTIONS') {
    json(res, 204, {});
    return;
  }

  if (url.pathname === '/health') {
    json(res, 200, { ok: true });
    return;
  }

  if (url.pathname === '/api/auth/google/url') {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      json(res, 500, {
        error: 'google_oauth_not_configured',
        message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before using Google OAuth.',
      });
      return;
    }

    cleanExpiredState();
    const state = randomToken();
    states.set(state, Date.now());

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'select_account');

    json(res, 200, { url: authUrl.toString() });
    return;
  }

  if (url.pathname === '/api/auth/google/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state || !states.has(state)) {
      redirect(res, frontendRedirect({ authError: 'invalid_google_oauth_state' }));
      return;
    }

    states.delete(state);

    try {
      const tokenResponse = await exchangeCodeForTokens(code);
      const user = await fetchGoogleUser(tokenResponse.access_token);
      const sessionToken = randomToken();
      sessions.set(sessionToken, {
        user,
        createdAt: new Date().toISOString(),
      });

      redirect(res, frontendRedirect({ authToken: sessionToken }));
    } catch (error) {
      console.error(error);
      redirect(res, frontendRedirect({ authError: 'google_oauth_failed' }));
    }
    return;
  }

  if (url.pathname === '/api/auth/session') {
    const token = authHeaderToken(req);
    const session = token ? sessions.get(token) : undefined;

    if (!session) {
      json(res, 401, { error: 'unauthorized' });
      return;
    }

    json(res, 200, { user: session.user });
    return;
  }

  if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
    const token = authHeaderToken(req);

    if (token) {
      sessions.delete(token);
    }

    json(res, 200, { ok: true });
    return;
  }

  json(res, 404, { error: 'not_found' });
}

http
  .createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error(error);
      json(res, 500, { error: 'internal_server_error' });
    });
  })
  .listen(PORT, () => {
    console.log(`Backend listening on ${BACKEND_PUBLIC_URL}`);
    console.log(`Google redirect URI: ${GOOGLE_REDIRECT_URI}`);
  });
