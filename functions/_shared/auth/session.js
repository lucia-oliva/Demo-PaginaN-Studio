import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  getAuthConfig,
} from './config.js';

import {
  decodeJson,
  encodeJson,
  randomToken,
  signValue,
  verifySignature,
} from './crypto.js';

function isHttps(request) {
  return new URL(request.url).protocol === 'https:';
}

function readCookie(request, cookieName) {
  const cookieHeader = request.headers.get('Cookie') || '';

  for (const cookiePart of cookieHeader.split(';')) {
    const separator = cookiePart.indexOf('=');

    if (separator === -1) {
      continue;
    }

    const name = cookiePart.slice(0, separator).trim();
    const value = cookiePart.slice(separator + 1).trim();

    if (name === cookieName) {
      try {
        return decodeURIComponent(value);
      } catch {
        return null;
      }
    }
  }

  return null;
}

function cookieAttributes(request, maxAge) {
  const attributes = [
    'HttpOnly',
    'Path=/',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
  ];

  if (isHttps(request)) {
    attributes.push('Secure');
  }

  return attributes;
}

export async function createAdminSession(context) {
  const config = getAuthConfig(context);
  const csrfToken = randomToken(32);
  const now = Date.now();

  const payload = {
    sub: config.username,
    role: 'admin',
    csrf: csrfToken,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const encodedPayload = encodeJson(payload);

  const signature = await signValue(
    encodedPayload,
    config.authSecret,
  );

  const token = `${encodedPayload}.${signature}`;

  const cookie = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    ...cookieAttributes(
      context.request,
      SESSION_MAX_AGE_SECONDS,
    ),
  ].join('; ');

  return {
    cookie,
    csrfToken,
    user: {
      username: config.username,
      role: 'admin',
    },
  };
}

export function createExpiredSessionCookie(request) {
  return [
    `${SESSION_COOKIE_NAME}=`,
    ...cookieAttributes(request, 0),
  ].join('; ');
}

export async function readAdminSession(context) {
  const config = getAuthConfig(context);

  const token = readCookie(
    context.request,
    SESSION_COOKIE_NAME,
  );

  if (!token) {
    return null;
  }

  const tokenParts = token.split('.');

  if (tokenParts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = tokenParts;

  const validSignature = await verifySignature(
    encodedPayload,
    signature,
    config.authSecret,
  );

  if (!validSignature) {
    return null;
  }

  try {
    const payload = decodeJson(encodedPayload);

    if (
      payload.sub !== config.username
      || payload.role !== 'admin'
      || typeof payload.csrf !== 'string'
      || typeof payload.exp !== 'number'
      || payload.exp <= Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}