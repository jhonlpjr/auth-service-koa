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
