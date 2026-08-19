CREATE TABLE auth_login_attempts (
  identifier_hash TEXT PRIMARY KEY,
  failed_attempts INTEGER NOT NULL DEFAULT 0
    CHECK (failed_attempts >= 0),
  window_started_at INTEGER NOT NULL,
  blocked_until INTEGER DEFAULT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_login_attempts_blocked
  ON auth_login_attempts (blocked_until);