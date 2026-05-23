-- ============================================================
-- SecureVault Database Schema V1
-- Flyway migration: V1__init_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS TABLE ─────────────────────────────────────────────────────────────
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username            VARCHAR(50)  NOT NULL UNIQUE,
    email               VARCHAR(255) NOT NULL UNIQUE,
    -- Stores ONLY the server-side re-hash of the client Argon2id hash
    -- Client sends: argon2id(password + clientSalt)
    -- Server stores: argon2id(clientHash + pepper, serverSalt)
    password_hash       TEXT         NOT NULL,
    role                VARCHAR(20)  NOT NULL DEFAULT 'USER'
                            CHECK (role IN ('USER', 'ADMIN')),
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    is_email_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    failed_login_count  INT          NOT NULL DEFAULT 0,
    locked_until        TIMESTAMP WITH TIME ZONE,
    last_login_at       TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active   ON users(is_active);

-- ─── REFRESH TOKENS TABLE ────────────────────────────────────────────────────
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT         NOT NULL UNIQUE,  -- SHA-256 of actual token
    device_info VARCHAR(500),
    ip_address  INET,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ─── AUDIT LOGS TABLE ────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,   -- LOGIN_SUCCESS, LOGIN_FAILED, REGISTER, LOGOUT, etc.
    ip_address  INET,
    user_agent  VARCHAR(500),
    metadata    JSONB,
    success     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id    ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action     ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ─── CREDENTIALS VAULT TABLE ─────────────────────────────────────────────────
-- Stores encrypted username/password entries per user
CREATE TABLE vault_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_name       VARCHAR(255) NOT NULL,
    site_url        VARCHAR(500),
    -- All sensitive fields encrypted with AES-256-GCM using user's derived key
    encrypted_username  TEXT     NOT NULL,
    encrypted_password  TEXT     NOT NULL,
    iv                  TEXT     NOT NULL,  -- Initialization vector (base64)
    notes           TEXT,
    category        VARCHAR(100),
    is_favorite     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vault_entries_user_id  ON vault_entries(user_id);
CREATE INDEX idx_vault_entries_site     ON vault_entries(user_id, site_name);

-- ─── AUTO-UPDATE updated_at TRIGGER ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_vault_entries
    BEFORE UPDATE ON vault_entries
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
