# Auth Service (Koa, TypeScript)

A production-ready **authentication microservice** exposing an HTTP API built with **Koa** and **Clean Architecture**.
Focus: security, clarity, and operability for real-world deployments.

---

## Key Features

- **BFF/S2S Auth**: JSON-only, no cookies or CSRF, secure for backend-for-frontend and server-to-server.
- **JWT**: Access tokens (RS256/ES256/EdDSA), rotating opaque refresh tokens, reuse detection.
- **Secure refresh token rotation**: Each use rotates the token and detects reuse to revoke compromised sessions.
- **No cookies, no CSRF**: No browser logic, only S2S APIs.
- **Strict CORS**: No external origins allowed by default. Only explicit origins via environment variables.
- **Clean Architecture** (Presentation / Application / Domain / Infrastructure)
- **Strict DTO validation** using `class-validator` for all input DTOs.
- **Consistent error handling** with HTTP exception classes and global middleware.
- **Response mapping**: all responses (success/error) go through a ResponseMapper.
- **Security hardening**: request-id, headers, rate limit, redacted logging, body limit, proxy-aware.
- **Dependency Injection** via Inversify
- **Docker-ready**, 12-Factor config via `.env`
- **PostgreSQL** (or your DB of choice), pluggable via adapters
- **Redis**: Required for rate limiting and MFA transaction storage

---

## Tech Stack

- **Language:** Node.js (≥ 18/20), TypeScript
- **Web:** Koa
- **Validation:** class-validator, class-transformer
- **Logging:** Pino (pretty in dev) with secret redaction
- **DB:** PostgreSQL (swap via adapters)
- **Auth:** JWT (default, PASETO optional/legacy)
- **DI:** Inversify
- **Cache/Rate Limit:** Redis (required for production/MFA)
- **Container:** Docker

---

## Project Structure

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
    usecases/          # Use cases (Login, RefreshToken, MFA, etc.)
    mappers/           # Application-level mappers
    service/           # Application services
  domain/
    entities/          # User, RefreshToken
    interfaces/        # Domain interfaces
    repository/        # Repository interfaces
  infrastructure/
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
    mappers/           # Shared mappers (e.g., ResponseMapper)
    utils/             # Shared utilities (logger, validators, etc.)
  app.ts               # Koa app wiring
```

---

## Getting Started

### 1) Requirements
- Node.js 18+ (20+ recommended)
- PostgreSQL running locally (or use Docker)
- Redis (required for rate limiting and MFA)

### 2) Install
```bash
npm ci
# or
pnpm i --frozen-lockfile
```

### 3) Configure Environment
Create `.env` (or use `.env.example`):

```env
JWT_DEFAULT_AUD=auth-clients
JWT_DEFAULT_SCOPE=default
JWT_TTL_SECONDS=900
PASETO_SECRET_NAME=paseto-private-key
# mTLS y S2S
AUTH_MTLS_ENABLED=false
BFF_CLIENT_KEY=your-bff-client-key
BFF_TLS_SUBJECT=CN=your-bff-client

# CORS (solo si necesitas exponer a frontends)
CORS_ALLOW_ORIGINS_LOCAL=http://localhost:3000
CORS_ALLOW_ORIGINS_DEV=https://tu-frontend.com

# Redis (opcional)
REDIS_HOST=host.docker.internal
REDIS_PORT=6379
REDIS_URL=redis://host.docker.internal:6379

# AWS/LocalStack
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
SECRETS_ENDPOINT=http://host.docker.internal:4566

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
/api/v1
```

### Auth API

- **POST** `/api/v1/login` — Autenticación S2S/BFF
  - **Request (JSON)**
    ```json
    { "username": "user1", "password": "strongPass123" }
    ```
  - **Response (200)**
    ```json
    {
      "access_token": "jwt...",
      "token_type": "Bearer",
      "expires_in": 900,
      "scope": "movies:read",
      "aud": "movies-api",
      "refresh_token": "...",
      "user_id": "uuid"
    }
    ```
  - **Errors**: `401 Unauthorized`, `429 Too Many Requests`, `400` para validación

- **POST** `/api/v1/refresh-token` — Rotar refresh token (BFF/S2S)
  - **Request (JSON)**
    ```json
    { "userId": "uuid", "refreshToken": "...", "aud": "movies-api", "scope": "movies:read" }
    ```
  - **Response (200)**
    ```json
    {
      "access_token": "jwt...",
      "token_type": "Bearer",
      "expires_in": 900,
      "scope": "movies:read",
      "aud": "movies-api",
      "refresh_token": "...",
      "user_id": "uuid"
    }
    ```
  - **Errors**: `401 Unauthorized`, `400` para validación

- **POST** `/api/v1/revoke` — Revocar refresh tokens (BFF/S2S)
  - **Request (JSON)**
    ```json
    { "userId": "uuid" }
    ```
  - **Response (200)**
    ```json
    { "revoked": true }
    ```


### MFA (Multi-Factor Authentication)

- **POST** `/api/v1/mfa/totp/setup` — Inicia el setup TOTP (devuelve `{ "otpauthUrl": "otpauth://..." }`)
- **POST** `/api/v1/mfa/totp/activate` — Activa TOTP tras validar el código (devuelve `{ "activated": true }`)
- **POST** `/api/v1/mfa/verify` — Verifica TOTP (devuelve `{ "verified": true }`)
- **POST** `/api/v1/mfa/recovery/verify` — Verifica recovery code (devuelve `{ "verified": true }`)
- **GET** `/api/v1/mfa/factors` — Lista factores MFA activos (array de `{ id, type, status, createdAt }`)

**Flujo típico:**
1. Usuario hace login → si requiere MFA, recibe `{ step: 'mfa', mfa: { types: [...] } }`
2. Frontend pide TOTP o recovery code y llama a `/mfa/verify` o `/mfa/recovery/verify`
3. Si es válido, recibe `{ verified: true }` y accede normalmente

**Notas:**
- Todos los endpoints MFA usan validación estricta de DTO (class-validator) y respuestas mapeadas por `ResponseMapper`.
- La documentación interactiva está en `/docs.html` y el archivo OpenAPI (`openapi.yaml`) está alineado con la implementación.

### Infra & Health

- **GET** `/metrics` — Prometheus metrics
- **GET** `/healthz` — Liveness probe
- **GET** `/readyz` — Readiness probe


---



## Security & Hardening

- **BFF/S2S only**: No cookies, no CSRF, solo APIs seguras para backend y server-to-server.
- **Refresh tokens rotativos**: Cada uso rota el token y detecta reuse (revoca todas las sesiones si hay reuse).
- **CORS seguro**: Por defecto no permite ningún origen externo. Solo permite orígenes explícitos vía variables de entorno.
- **Request ID**: Todas las respuestas incluyen `X-Request-Id`.
- **Error Handling**: Middleware global, respuestas JSON consistentes.
- **Security Headers**: Frame blocking, no-sniff, no-referrer, etc.
- **Rate Limiting**: In-memory global, más estricto en `/login`. Redis-ready para producción.
- **Body Limit**: `128kb`
- **Proxy Awareness**: `app.proxy = true` (respeta `X-Forwarded-For`)
- **Logging**: Pino, redacta `Authorization`, `password`, `token`
- **Password Hashing**: Argon2
- **Token Format**: JWT/PASETO (upgradeable, JWKS endpoint)

---

## Ejemplo de uso con curl


### Login
```bash
curl -X POST http://localhost:6080/api/v1/login \
  -H "Content-Type: application/json" \
  -H "X-Client-Key: <tu-client-key>" \
  -d '{"username":"user1","password":"strongPass123"}'
```

### Refresh token (con aud/scope)
```bash
curl -X POST http://localhost:6080/api/v1/refresh-token \
  -H "Content-Type: application/json" \
  -H "X-Client-Key: <tu-client-key>" \
  -d '{"userId":"uuid","refreshToken":"...","aud":"movies-api","scope":"movies:read"}'
```

### Revocar todos los refresh tokens de un usuario
```bash
curl -X POST http://localhost:6080/api/v1/revoke \
  -H "Content-Type: application/json" \
  -H "X-Client-Key: <tu-client-key>" \
  -d '{"userId":"uuid"}'
```

---

## Variables de entorno principales

| Variable                | Descripción                                      | Ejemplo/Valor           |
|-------------------------|--------------------------------------------------|-------------------------|
| PORT                    | Puerto HTTP                                      | 6080                    |
| PG_HOST                 | Host de PostgreSQL                               | host.docker.internal    |
| PG_PORT                 | Puerto de PostgreSQL                             | 5432                    |
| PG_USER                 | Usuario de PostgreSQL                            | admin                   |
| PG_PASSWORD             | Contraseña de PostgreSQL                         | ...                     |
| PG_DATABASE             | Base de datos                                    | auth_db                 |
| JWT_PRIVATE_KEY_PATH    | Ruta a la clave privada JWT (PEM)                | ./keys/jwt-private-key.pem |
| JWT_ALG                 | Algoritmo JWT                                    | RS256                   |
| JWT_ISS                 | Issuer (iss)                                     | auth-service            |
| JWT_DEFAULT_AUD         | Audiencia por defecto (aud)                      | auth-clients            |
| JWT_DEFAULT_SCOPE       | Scope por defecto                                | default                 |
| JWT_TTL_SECONDS         | Tiempo de vida del access token (segundos)       | 900                     |
| PASETO_SECRET_NAME      | Nombre del secreto PASETO en AWS/local           | paseto-private-key      |
| AUTH_MTLS_ENABLED       | Habilitar mTLS para S2S                          | false                   |
| BFF_CLIENT_KEY          | Clave de cliente S2S                             | your-bff-client-key     |
| BFF_TLS_SUBJECT         | Subject esperado en el certificado del BFF        | CN=your-bff-client      |
| SUPER_SECRET_KEY        | Clave para endpoints protegidos (superuser)       | super-secret-key        |
| CORS_ALLOW_ORIGINS_*    | Orígenes permitidos para CORS                    | http://localhost:3000   |
| REDIS_HOST              | Host de Redis (opcional)                         | host.docker.internal    |
| AWS_REGION              | Región AWS (si usas LocalStack o AWS)            | us-east-1               |
| AWS_ACCESS_KEY_ID       | AWS Access Key                                   | ...                     |
| AWS_SECRET_ACCESS_KEY   | AWS Secret Key                                   | ...                     |
| SECRETS_ENDPOINT        | Endpoint de secrets (LocalStack)                  | http://host.docker.internal:4566 |

---

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
