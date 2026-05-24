# SecureVault Backend — Deployment Guide

## Stack
- **Backend**: Spring Boot 3.2 on Render (Web Service)
- **Database**: Neon PostgreSQL (serverless)
- **Frontend**: Vercel (React)

---

## 1. Generate Secrets (run locally)

```bash
# JWT secret (Base64-encoded 64 random bytes)
openssl rand -base64 64

# AES-256 encryption key (Base64-encoded 32 random bytes)
openssl rand -base64 32
```

---

## 2. Neon Database Setup

1. Create a project at https://neon.tech
2. Copy the **connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Tables are auto-created by Hibernate (`ddl-auto=update`) on first boot.

---

## 3. Render Web Service Setup

**Build Command:**
```
mvn clean package -DskipTests
```

**Start Command:**
```
java -jar target/securevault-backend-1.0.0.jar
```

**Environment Variables to set in Render dashboard:**

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Output of `openssl rand -base64 64` |
| `ENCRYPTION_KEY` | Output of `openssl rand -base64 32` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` (Vercel URL, no trailing slash) |
| `PORT` | `8080` (Render sets this automatically) |

---

## 4. Frontend (Vercel) — Update API Base URL

In your React app, set the environment variable:
```
VITE_API_BASE_URL=https://your-service.onrender.com
```

Or update the constant directly:
```js
const API_BASE = "https://your-service.onrender.com/api";
```

---

## 5. API Endpoints

### Auth (public)
```
POST /api/auth/register   { name, email, password }  → { token, user }
POST /api/auth/login      { email, password }         → { token, user }
```

### Credentials (requires Bearer token)
```
GET    /api/credentials          → [ credential[] ]
POST   /api/credentials          → credential
PUT    /api/credentials/{id}     → credential
DELETE /api/credentials/{id}     → 204 No Content
```

---

## 6. Security Architecture

```
Client (Vercel)
    │
    │  HTTPS
    ▼
Spring Boot (Render)
    │
    ├── JwtFilter: validates Bearer token on every request
    ├── AuthService: Argon2id hashes master password (OWASP-compliant params)
    ├── EncryptionService: AES-256-GCM encrypts stored passwords
    │     └── IV is randomly generated per-encryption, prepended to ciphertext
    └── CredentialService: decrypts only for the authenticated owner
    │
    │  TLS (sslmode=require)
    ▼
Neon PostgreSQL
    ├── users (id, name, email, password_hash)
    └── credentials (id, user_id, title, username, encrypted_password, ...)
```

**Two-layer encryption:**
- **Master password** → Argon2id hash (never reversible)
- **Stored passwords** → AES-256-GCM (reversible only with ENCRYPTION_KEY env var)
