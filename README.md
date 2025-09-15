# Auth Service (Koa, TypeScript)

A production-ready **authentication microservice** exposing an HTTP API built with **Koa** and **Clean Architecture**.  
Focus: security, clarity, and operability for portfolios and real deployments.

---

## Key Features

- **HTTP API (Koa)** with thin routes and controllers
- **Clean Architecture** (Presentation / Application / Domain / Infrastructure)
- **Security hardening (first pass)**  
  - Request correlation: `X-Request-Id` on every request  
  - Global error handler with consistent JSON responses  
  - Baseline security headers + minimal CORS allowlist  
  - In-memory rate limiting (stricter on `/login`)  
  - Body size limit (`128kb`) and `app.proxy = true` for real client IPs behind proxies/CDNs  
  - Redacted logging (Authorization/password/token)
- **Docker-ready**, 12-Factor configuration via `.env`
- **PostgreSQL** (or your DB of choice), pluggable via adapters

> Next steps (roadmap): Argon2id password hashing, DTO validation (Zod), Redis rate limiting (IP + username), PASETO / JWT with key rotation, conditional CAPTCHA, metrics with Prometheus, rotating refresh tokens.

---

## Tech Stack

- **Language:** Node.js (≥ 18/20), TypeScript
- **Web:** Koa
- **Logging:** Pino (pretty in dev) with secret redaction
- **DB:** PostgreSQL (swap via adapters)
- **Auth:** JWT (upgradeable to PASETO / JWKS rotation)
- **Cache/Rate Limit (optional prod):** Redis
- **Container:** Docker

---

## Project Structure

```txt
src/
  presentation/
    http/
      routes/            # Koa routes (thin)
      controllers/       # Controllers (no business logic)
      dto/               # Request/Response DTOs (validation)
      middleware/        # request-id, error-handler, cors, logger, guards
  application/
    usecases/            # LoginUser, RefreshToken, etc.
    ports/               # UserRepository, TokenService, RateLimiter...
  domain/
    entities/            # User, RefreshToken
    value-objects/       # Email, PasswordHash
    errors/              # Domain errors
  infra/
    db/                  # Repositories (Prisma/TypeORM/Knex)
    tokens/              # JWT/PASETO implementations
    cache/               # Redis rate limiter/adapters
  app.ts                 # Koa app wiring
```

> If you’re migrating from a flatter layout, you can keep your current files and move them gradually into the structure above.

---

## Getting Started

### 1) Requirements
- Node.js 18+ (20+ recommended)
- PostgreSQL running locally (or use Docker)
- (Optional) Redis for production-grade rate limiting

### 2) Install
```bash
npm ci
# or
pnpm i --frozen-lockfile
```

### 3) Configure Environment
Create `.env` (or use `.env.example`):

```env
# App
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database (adjust to your setup)
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DATABASE=auth_db

# Auth (rotate in prod)
JWT_SECRET=replace_with_strong_secret
JWT_ISS=auth-service
JWT_AUD=auth-clients
JWT_ACCESS_TTL=10m
JWT_REFRESH_TTL=30d

# Optional (future)
REDIS_URL=redis://localhost:6379
```

### 4) Run
```bash
npm run dev
# open http://localhost:3000
```

### 5) Build & Start
```bash
npm run build
npm run start
```

---

## Docker

Example multi-stage build (adjust paths as needed):

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["dist/app.js"]
```

Run:
```bash
docker build -t auth-service:local .
docker run --rm -p 3000:3000 --env-file .env auth-service:local
```

---

## API

### Base URL
```
/v1
```

### Auth
> Implemented today: `/auth/login`. Others listed as “planned” are part of the roadmap.

- **POST** `/auth/login` — Authenticate user  
  - **Request (JSON)**
    ```json
    { "email": "user@example.com", "password": "strongPass123", "deviceId": "optional-uuid" }
    ```
  - **Response (200)**
    ```json
    {
      "accessToken": "jwt...",
      "refreshToken": "jwt...",
      "userId": "uuid"
    }
    ```
  - **Errors**: `401 Unauthorized`, `429 Too Many Requests` (with `Retry-After`), `400/422` for validation

- **POST** `/auth/refresh` — (Planned) Rotate refresh token
- **POST** `/auth/logout` — (Planned) Revoke current session
- **POST** `/auth/register` — (Optional) Create user with email verification
- **GET**  `/auth/me` — (Optional) Return current identity

### Health
- **GET** `/healthz` — basic liveness (no sensitive data) *(planned)*
- **GET** `/readyz` — readiness for load balancers *(planned)*

---

## Security & Hardening

- **Request ID**: Incoming requests receive `X-Request-Id`; echoed in error responses.
- **Error Handling**: Unified JSON errors with non-leaky messages (maps unauthorized to 401).
- **Security Headers**: Frame blocking, no-sniff, no-referrer, etc.
- **CORS**: Minimal allowlist (edit in `presentation/http/middleware/cors.ts` or `security.ts`).
- **Rate Limiting**:
  - Global in-memory limiter (per instance).
  - Stricter limiter on `/auth/login`.
  - **Production**: replace with Redis-backed limiter to work across replicas.
- **Body Limit**: `128kb`.
- **Proxy Awareness**: `app.proxy = true` (respects `X-Forwarded-For`).
- **Logging**: Pino, with redaction of `Authorization`, `password`, `token`.

> Upcoming: **Argon2id** hashing, **Redis** rate limiting per IP & username, **PASETO/JWT with key rotation**, **conditional CAPTCHA**, **Prometheus metrics**, **rotating refresh tokens with reuse detection**.

---

## Scripts

```bash
# Development
npm run dev

# Build / Start
npm run build
npm run start

# Quality (if configured)
npm run lint
npm run typecheck
npm test
```

---

## Testing (suggested)

- **Unit**: Use cases (e.g., `LoginUser` happy path & failures)
- **Integration**: `/auth/login` with test DB and real hashing
- **E2E**: Spin-up via Docker Compose (DB + service), hit HTTP endpoints
- **Security**: Rate limit, invalid tokens, brute-force attempts

---

## Deployment Notes

- Place the service behind an **API Gateway / Ingress / CDN**.
- Enforce **TLS** end-to-end.
- Set proper **timeouts** and **readiness/liveness** checks.
- Configure **secrets management** (don’t bake secrets into images).
- **Autoscaling** + **Redis rate limiting** recommended for internet-facing setups.

---

## Roadmap

- [ ] Argon2id password hashing (replace bcrypt)
- [ ] DTO validation with Zod (strict input/output)
- [ ] Redis rate limiting (IP + username) with backoff/locks
- [ ] PASETO or JWT with `kid` + JWKS rotation
- [ ] Conditional CAPTCHA after N failures
- [ ] Metrics (`/metrics`) + `/healthz` + `/readyz`
- [ ] Rotating refresh tokens + reuse detection

---

## License

By Jonathan Reyna
