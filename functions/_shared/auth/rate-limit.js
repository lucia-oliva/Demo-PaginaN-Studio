import { getAuthConfig } from './config.js';
import { sha256Hex } from './crypto.js';

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MILLISECONDS = 15 * 60 * 1000;
const BLOCK_MILLISECONDS = 15 * 60 * 1000;

function getClientAddress(request) {
  const cloudflareAddress =
    request.headers.get('CF-Connecting-IP');

  if (cloudflareAddress) {
    return cloudflareAddress.slice(0, 100);
  }

  const forwardedAddress =
    request.headers.get('X-Forwarded-For');

  if (forwardedAddress) {
    return forwardedAddress
      .split(',')[0]
      .trim()
      .slice(0, 100);
  }

  return 'local-development';
}

async function getIdentifierHash(context) {
  const config = getAuthConfig(context);
  const address = getClientAddress(context.request);

  return sha256Hex(
    `${config.authSecret}|login|${address}`,
  );
}

async function findAttempt(database, identifierHash) {
  return database
    .prepare(`
      SELECT
        identifier_hash,
        failed_attempts,
        window_started_at,
        blocked_until
      FROM auth_login_attempts
      WHERE identifier_hash = ?
    `)
    .bind(identifierHash)
    .first();
}

export async function checkLoginRateLimit(context) {
  const identifierHash = await getIdentifierHash(context);
  const attempt = await findAttempt(
    context.env.DB,
    identifierHash,
  );

  const now = Date.now();

  if (
    attempt?.blocked_until
    && attempt.blocked_until > now
  ) {
    return {
      allowed: false,
      identifierHash,
      retryAfterSeconds: Math.ceil(
        (attempt.blocked_until - now) / 1000,
      ),
    };
  }

  return {
    allowed: true,
    identifierHash,
    retryAfterSeconds: 0,
  };
}

export async function recordLoginFailure(
  database,
  identifierHash,
) {
  const current = await findAttempt(
    database,
    identifierHash,
  );

  const now = Date.now();

  const currentWindowIsActive =
    current
    && now - current.window_started_at
      < WINDOW_MILLISECONDS;

  const failedAttempts = currentWindowIsActive
    ? current.failed_attempts + 1
    : 1;

  const windowStartedAt = currentWindowIsActive
    ? current.window_started_at
    : now;

  const blockedUntil =
    failedAttempts >= MAX_FAILED_ATTEMPTS
      ? now + BLOCK_MILLISECONDS
      : null;

  await database
    .prepare(`
      INSERT INTO auth_login_attempts (
        identifier_hash,
        failed_attempts,
        window_started_at,
        blocked_until,
        updated_at
      )
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(identifier_hash)
      DO UPDATE SET
        failed_attempts = excluded.failed_attempts,
        window_started_at = excluded.window_started_at,
        blocked_until = excluded.blocked_until,
        updated_at = CURRENT_TIMESTAMP
    `)
    .bind(
      identifierHash,
      failedAttempts,
      windowStartedAt,
      blockedUntil,
    )
    .run();

  return {
    blocked: blockedUntil !== null,
    retryAfterSeconds: blockedUntil
      ? Math.ceil((blockedUntil - now) / 1000)
      : 0,
  };
}

export async function clearLoginFailures(
  database,
  identifierHash,
) {
  await database
    .prepare(`
      DELETE FROM auth_login_attempts
      WHERE identifier_hash = ?
    `)
    .bind(identifierHash)
    .run();
}