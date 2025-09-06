# ms-auth — Hardening (Initial Improvements)

Includes:
- Request ID (`X-Request-Id`) in every request and propagated in errors.
- Global error handler (consistent JSON + requestId).
- Security headers + minimal CORS (allowlist editable in `security.ts`).
- In-memory rate limiting (per-instance) and stricter on `/login`.
- Body size limit (128KB) and `app.proxy = true`.
- Logger with sensitive field redaction.

## Environment Variables
```env
PORT=3000
LOG_LEVEL=info
# PostgreSQL (adjust to your project)
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DATABASE=mydb
# JWT (placeholder; rotate in production)
JWT_SECRET=replace_with_strong_secret
```
