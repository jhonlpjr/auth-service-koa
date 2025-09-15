
import { Context, Next } from "koa";
import redis from '../../infraestructure/providers/redis';

function getKey(ip: string, username?: string, scope?: string) {
  if (username) return `${scope || 'login'}:user:${username}`;
  return `${scope || 'global'}:ip:${ip}`;
}

export function rateLimitRedis(opts?: { windowMs?: number; max?: number; scope?: string; byUsername?: boolean }) {
  const windowMs = opts?.windowMs ?? 60_000;
  const max = opts?.max ?? 20;
  const scope = opts?.scope ?? "global";
  const byUsername = opts?.byUsername ?? false;

  return async (ctx: Context, next: Next) => {
    const ip = ctx.ip || ctx.request.ip || "unknown";
    let username: string | undefined;
    const body = ctx.request.body as Record<string, any>;
    if (byUsername && body && typeof body.username === 'string') {
      username = body.username;
    }
    const key = getKey(ip, username, scope);
    const now = Date.now();
    const ttl = Math.ceil(windowMs / 1000);
    let count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, ttl);
    }
    if (count > max) {
      const retryAfter = await redis.ttl(key);
      ctx.set("Retry-After", String(retryAfter));
      ctx.status = 429;
      ctx.body = { error: "Too Many Requests" };
      return;
    }
    await next();
  };
}

// Rate limit híbrido para login: por IP y por username
export const loginRateLimit = [
  rateLimitRedis({ windowMs: 60_000, max: 10, scope: "login" }),
  rateLimitRedis({ windowMs: 60_000, max: 10, scope: "login", byUsername: true })
];
