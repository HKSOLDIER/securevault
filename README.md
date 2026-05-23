# 🔐 SecureVault — Production-Grade Password Manager

Full-stack secure credential storage with:
- **Client-side Argon2id hashing** (password never leaves device in plaintext)
- **Server-side double-hash** with Argon2id + pepper
- **AES-256-GCM** encrypted vault entries
- **JWT + Refresh Token** rotation
- **Rate limiting** (Bucket4j) and **account lockout**
- **Audit logging** for all auth events

---

## Architecture

```
Browser (React/Vite on Vercel)
  │
  │  argon2id(password, salt)  ← CLIENT HASH (password never sent raw)
  │
  ▼
Spring Boot API (Railway)
  │
  │  argon2id(clientHash + pepper, serverSalt)  ← SERVER DOUBLE-HASH
  │
  ▼
PostgreSQL (Railway)
  └── stores: server_hash, encrypted_vault_entries, audit_logs, refresh_tokens
```

---

## Security Model

| Layer | What | Where |
|-------|------|--------|
| Client Argon2id | Hash password before sending | Browser (argon2-browser WASM) |
| Transport | HTTPS / TLS | Vercel + Railway |
| Server Argon2id | Hash client-hash again with pepper | Spring Boot |
| Pepper | Secret mixed into hash, stored in env | Railway env variable |
| JWT | Short-lived access (15m) | Spring Boot |
| Refresh Token | 7-day, stored as SHA-256 hash | PostgreSQL |
| AES-256-GCM | Vault entry encryption | Browser (Web Crypto API) |
| Rate Limiting | 5 logins/15min, 3 registers/hr | Bucket4j in-memory |
| Account Lockout | 5 failed → 15min lock | DB field |

---

## Project Structure

```
securevault/
├── backend/                          # Spring Boot 3.3 (Java 21)
│   ├── src/main/java/com/securevault/
│   │   ├── SecureVaultApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java   # Spring Security 6, JWT, headers
│   │   │   └── AppConfig.java        # CORS, Argon2id PasswordEncoder
│   │   ├── controller/
│   │   │   └── AuthController.java   # POST /auth/{register,login,refresh,logout,me}
│   │   ├── service/
│   │   │   ├── AuthService.java      # Registration, login, lockout logic
│   │   │   └── JwtService.java       # Access + refresh token handling
│   │   ├── model/
│   │   │   ├── User.java             # UserDetails entity
│   │   │   └── Entities.java         # RefreshToken, AuditLog, VaultEntry
│   │   ├── dto/
│   │   │   └── Dtos.java             # All request/response DTOs
│   │   ├── filter/
│   │   │   ├── JwtAuthFilter.java    # JWT validation per request
│   │   │   └── RateLimitFilter.java  # Bucket4j rate limiter
│   │   ├── repository/
│   │   │   └── UserRepository.java
│   │   └── exception/
│   │       └── GlobalExceptionHandler.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/
│   │       └── V1__init_schema.sql   # Flyway: users, refresh_tokens, vault_entries, audit_logs
│   ├── Dockerfile                    # Multi-stage Java 21 Alpine build
│   ├── railway.json
│   └── .env.example
│
└── frontend/                         # React 18 + Vite
    ├── src/
    │   ├── App.jsx                   # Router, protected routes
    │   ├── pages/                    # Login, Register, Dashboard
    │   ├── services/
    │   │   ├── api.js                # Axios + auto token refresh
    │   │   └── crypto.js             # Argon2id client-side hashing
    │   └── store/
    │       └── authStore.js          # Zustand auth state
    ├── vercel.json                   # SPA rewrites + security headers
    └── .env.example
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register with client-hashed password |
| POST | `/api/auth/login` | ❌ | Login, returns access + refresh tokens |
| POST | `/api/auth/refresh` | ❌ | Rotate refresh token |
| POST | `/api/auth/logout` | ✅ JWT | Revoke refresh token |
| GET | `/api/auth/me` | ✅ JWT | Get current user profile |
| GET | `/api/vault` | ✅ JWT | List encrypted vault entries |
| POST | `/api/vault` | ✅ JWT | Add encrypted entry |
| PUT | `/api/vault/{id}` | ✅ JWT | Update entry |
| DELETE | `/api/vault/{id}` | ✅ JWT | Delete entry |

### Register Request
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "clientPasswordHash": "<base64 argon2id output from browser>"
}
```

### Login Request
```json
{
  "identifier": "johndoe",
  "clientPasswordHash": "<base64 argon2id output from browser>"
}
```

### Auth Response
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "base64url...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": { "id": "uuid", "username": "johndoe", "email": "john@example.com", "role": "USER" }
}
```

---

## Local Development

### Prerequisites
- Java 21
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15+
- Docker (optional)

### Backend
```bash
cd backend

# Create database
createdb securevault

# Configure environment
cp .env.example .env
# Edit .env with your values

# Run
mvn spring-boot:run
# → http://localhost:8080/api
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit VITE_API_URL=http://localhost:8080/api

npm run dev
# → http://localhost:5173
```

---

## Deployment

### Backend → Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo → choose the `backend/` directory
4. Add a **PostgreSQL** plugin in Railway
5. Set environment variables in Railway **Variables** tab:
   ```
   JWT_SECRET=<openssl rand -base64 64>
   PEPPER_SECRET=<openssl rand -base64 32>
   CORS_ORIGINS=https://your-app.vercel.app
   DATABASE_URL=<auto-provided by Railway PostgreSQL plugin>
   ```
6. Railway auto-detects the Dockerfile → builds and deploys
7. Note your Railway URL: `https://your-app.railway.app`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your repo → set **Root Directory** to `frontend`
3. Framework: **Vite** (auto-detected)
4. Add environment variable:
   ```
   VITE_API_URL=https://your-app.railway.app/api
   ```
5. Deploy → Vercel gives you `https://your-app.vercel.app`
6. Update Railway's `CORS_ORIGINS` with your Vercel URL

### Final Step: Connect them
Go to Railway → Variables → update:
```
CORS_ORIGINS=https://your-app.vercel.app
```

---

## Database Schema

```sql
users            -- id, username, email, password_hash, role, failed_login_count, locked_until
refresh_tokens   -- id, user_id, token_hash (SHA-256), expires_at, revoked
vault_entries    -- id, user_id, site_name, encrypted_username, encrypted_password, iv
audit_logs       -- id, user_id, action, ip_address, success, created_at
```

---

## Generate Secrets

```bash
# JWT Secret (256-bit minimum)
openssl rand -base64 64

# Pepper Secret
openssl rand -base64 32
```

Never commit secrets to git. Always use environment variables.
