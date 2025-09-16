# Auth Service (Koa, TypeScript)

A production-ready **authentication microservice** exposing an HTTP API built with **Koa** and **Clean Architecture**.  
Focus: security, clarity, and operability for portfolios and real deployments.

---


## Key Features

- **HTTP API (Koa)** with thin routes and controllers
- **Clean Architecture** (Presentation / Application / Domain / Infrastructure)
- **Strict DTO validation** using `class-validator` on all request DTOs
- **Consistent error handling** with custom HTTP exception classes and global error middleware
- **Response mapping**: all responses (success/error) are mapped via a shared `ResponseMapper`
- **Security hardening**
  - Request correlation: `X-Request-Id` on every request
  - Global error handler with consistent JSON responses (includes requestId)
  - Security headers, minimal CORS allowlist
  - In-memory rate limiting (stricter on `/login`), Redis-ready
  - Body size limit (`128kb`), `app.proxy = true` for real client IPs
  - Redacted logging (Authorization/password/token)
- **Dependency Injection** via Inversify
- **Docker-ready**, 12-Factor configuration via `.env`
- **PostgreSQL** (or your DB of choice), pluggable via adapters

> Roadmap: Zod validation, Redis rate limiting, PASETO/JWT with key rotation, conditional CAPTCHA, Prometheus metrics, rotating refresh tokens.

---


## Tech Stack

- **Language:** Node.js (≥ 18/20), TypeScript
- **Web:** Koa
- **Validation:** class-validator, class-transformer
- **Logging:** Pino (pretty in dev) with secret redaction
- **DB:** PostgreSQL (swap via adapters)
- **Auth:** PASETO (upgradeable, JWT compatible)
- **DI:** Inversify
- **Cache/Rate Limit:** In-memory, Redis-ready
- **Container:** Docker

---


## Project Structure (actual)

```txt
src/
  api/
    controllers/       # Controllers (no business logic)
    dto/
      request/         # Request DTOs (validation)
      response/        # Response DTOs
    middleware/        # request-id, error-handler, cors, logger, guards
    mappers/           # API mappers
    routes/            # Koa routes
  application/
    usecases/          # Use cases (Login, RefreshToken, etc.)
    mappers/           # Application-level mappers
    service/           # Application services
  domain/
    entities/          # User, RefreshToken
    interfaces/        # Domain interfaces
    repository/        # Repository interfaces
  infraestructure/
    config/            # Environment config
    crypto/            # Password hasher, crypto utils
    database/
      repositories/    # DB repository implementations
    providers/         # DI container, types
    secrets/           # Secrets manager
  shared/
    api/exceptions/    # Custom HTTP exception classes
    constants/         # Shared constants
    enums/             # Shared enums
    helpers/           # Shared helpers
    mappers/           # Shared mappers (e.g., ResponseMapper)
    utils/             # Shared utilities (logger, validators, etc.)
  app.ts               # Koa app wiring
```

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
Example for Dockerized app connecting to services on your host:

# App
PORT=6080
NODE_ENV=development
LOG_LEVEL=info

# Database (adjust to your setup)
PG_HOST=host.docker.internal
PG_PORT=5432
PG_USER=admin
PG_PASSWORD=your_password
PG_DATABASE=auth_db

# Auth (rotate in prod)
JWT_SECRET=replace_with_strong_secret
JWT_ISS=auth-service
JWT_AUD=auth-clients
JWT_ACCESS_TTL=10m
JWT_REFRESH_TTL=30d

# Optional (future)
REDIS_HOST=host.docker.internal
REDIS_PORT=6379
REDIS_URL=redis://host.docker.internal:6379

# AWS/LocalStack
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
SECRETS_ENDPOINT=http://host.docker.internal:4566

# PASETO
PASETO_SECRET_NAME=paseto-private-key

# SUPERADMIN
SUPER_SECRET_KEY=super-secret-key
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


---

## Docker Compose (local development only)

This project **does not use a custom Dockerfile**. For local development and testing, use only `docker-compose.yml`, which mounts the source code and runs the service in an official Node.js container. This setup allows you to access external services (Postgres, Redis, LocalStack) on your host machine using `host.docker.internal`.

Usage example:

```bash
docker-compose up --build
# The service will be available at http://localhost:6080
```

---

## AWS Lambda Deployment (SAM)

For AWS Lambda deployment, use AWS SAM. The template is located at `deploy/aws-sam/template.yaml`.

Basic steps:

1. Install AWS SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
2. Configure your AWS credentials (`aws configure` or environment variables).
3. Build and deploy:

```bash
sam build --template-file deploy/aws-sam/template.yaml
sam deploy --guided
```

AWS credentials can be set via environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`) or the standard AWS CLI config file.

---

## OpenAPI Documentation (RapiDoc)

Interactive API documentation is available at `public/docs.html` using RapiDoc and the OpenAPI file `public/openapi.yaml`.

To view locally:

1. Start the service (`npm run dev` or `docker-compose up`).
2. Open `http://localhost:6080/docs.html` in your browser.

This allows you to test endpoints and see required headers directly from the web interface.

## API

### Base URL
```
/v1
```


### Auth API

- **POST** `/api/v1/login` — Authenticate user
  - **Request (JSON)**
    ```json
    { "username": "user1", "password": "strongPass123" }
    ```
  - **Response (200)**
    ```json
    {
      "token": "paseto...",
      "refreshToken": "...",
      "user": { "id": "uuid", "username": "user1" }
    }
    ```
  - **Errors**: `401 Unauthorized`, `429 Too Many Requests`, `400` for validation

- **POST** `/api/v1/refresh-token` — Rotate refresh token
  - **Request (JSON)**
    ```json
    { "userId": "uuid", "refreshToken": "..." }
    ```
  - **Response (200)**
    ```json
    {
      "token": "paseto...",
      "refreshToken": "..."
    }
    ```
  - **Errors**: `401 Unauthorized`, `400` for validation

- **POST** `/api/v1/get-payload` — Get token payload
  - **Request (JSON)**
    ```json
    { "token": "paseto..." }
    ```
  - **Response (200)**
    ```json
    {
      "id": "uuid",
      "username": "user1",
      "key": "..."
    }
    ```
  - **Errors**: `401 Unauthorized`, `400` for validation

- **POST** `/api/v1/super/create-user` — Create user (superuser, protected)
  - **Request (JSON)**
    ```json
    { "username": "admin", "email": "admin@example.com", "password": "...", "key": "..." }
    ```
  - **Response (200)**
    ```json
    {
      "user": { "id": "uuid", "username": "admin", "email": "admin@example.com" },
      "key": "..."
    }
    ```
  - **Errors**: `403 Forbidden`, `400` for validation

### Infra & Health

- **GET** `/metrics` — Prometheus metrics
- **GET** `/healthz` — Liveness probe
- **GET** `/readyz` — Readiness probe

### Health
- **GET** `/healthz` — basic liveness (no sensitive data) *(planned)*
- **GET** `/readyz` — readiness for load balancers *(planned)*

---


## Security & Hardening

- **Request ID**: All requests receive `X-Request-Id`, echoed in error responses.
- **Error Handling**: Global error handler returns consistent JSON, maps exceptions to HTTP codes, includes requestId.
- **Security Headers**: Frame blocking, no-sniff, no-referrer, etc.
- **CORS**: Minimal allowlist (see `api/middleware/cors.ts` or `security.ts`).
- **Rate Limiting**:
  - Global in-memory limiter (per instance)
  - Stricter limiter on `/api/v1/login`
  - **Production**: swap for Redis-backed limiter for distributed setups
- **Body Limit**: `128kb`
- **Proxy Awareness**: `app.proxy = true` (respects `X-Forwarded-For`)
- **Logging**: Pino, with redaction of `Authorization`, `password`, `token`
- **Password Hashing**: Argon2
- **Token Format**: PASETO (upgradeable, JWT compatible)

---


## Scripts

```bash
# Development
npm run dev

# Build / Start
npm run build
npm run start

# Quality
npm run lint
npm run typecheck
# (add tests as needed)
```

---


## Testing (suggested)

- **Unit**: Use cases (e.g., login, refresh, payload extraction)
- **Integration**: `/api/v1/login` and `/api/v1/refresh-token` with test DB and real hashing
- **E2E**: Docker Compose (DB + service), hit HTTP endpoints
- **Security**: Rate limit, invalid tokens, brute-force attempts

---

### Unit Testing

Unit tests are located in the `test/` directory and cover core logic, error handling, and edge cases for each module. Key areas:

- **Use Cases:**
  - `login.usecase.spec.ts`: Tests login flow, password validation, token generation, and error scenarios.
  - `refresh-token.usecase.spec.ts`: Tests refresh token rotation, validation, and error handling.
- **Crypto & Utils:**
  - `argon-2-password-hasher.spec.ts`: Tests password hashing, verification, and rehash logic.
  - `validators.spec.ts`: Tests DTO validation and error mapping.
- **Infrastructure:**
  - `secret-manager.service.spec.ts`: Tests AWS Secrets Manager integration, singleton behavior, and error cases.
- **Exceptions:**
  - `bad-request-error.spec.ts`: Tests custom error properties and details.

All unit tests use Jest with mocks for external dependencies. Run all tests with:

```bash
npm test
```

You can run a specific test file with:

```bash
npx jest test/path/to/file.spec.ts
```

Test coverage is reported in the `coverage/` directory after running the tests.

---

## Deployment Notes

- Place the service behind an **API Gateway / Ingress / CDN**.
- Enforce **TLS** end-to-end.
- Set proper **timeouts** and **readiness/liveness** checks.
- Configure **secrets management** (don’t bake secrets into images).
- **Autoscaling** + **Redis rate limiting** recommended for internet-facing setups.

---


## Roadmap

- [ ] Zod validation (strict input/output)
- [ ] Redis rate limiting (IP + username) with backoff/locks
- [ ] PASETO/JWT with `kid` + JWKS rotation
- [ ] Conditional CAPTCHA after N failures
- [ ] Metrics (`/metrics`) + `/healthz` + `/readyz`
- [ ] Rotating refresh tokens + reuse detection

---

## License

By Jonathan Reyna
