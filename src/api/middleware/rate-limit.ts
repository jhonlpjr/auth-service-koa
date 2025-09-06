import { Context, Next } from "koa";

type Counter = { count: number; resetAt: number };
const buckets = new Map<string, Counter>();

function keyFor(ip: string, scope: string) {
  return `${scope}:${ip}`;
}

export function rateLimit(opts?: { windowMs?: number; max?: number; scope?: string }) {
  const windowMs = opts?.windowMs ?? 60_000;
  const max = opts?.max ?? 20;
  const scope = opts?.scope ?? "global";

  return async (ctx: Context, next: Next) => {
    const ip = ctx.ip || ctx.request.ip || "unknown";
    const k = keyFor(ip, scope);
    const now = Date.now();
    const info = buckets.get(k);

    if (!info || info.resetAt < now) {
      buckets.set(k, { count: 1, resetAt: now + windowMs });
    } else {
      info.count += 1;
      if (info.count > max) {
        const retryAfter = Math.ceil((info.resetAt - now) / 1000);
        ctx.set("Retry-After", String(retryAfter));
        ctx.status = 429;
        ctx.body = { error: "Too Many Requests" };
        return;
      }
    }
    await next();
  };
}

// Más estricto solo para /login
export const loginRateLimit = rateLimit({ windowMs: 60_000, max: 10, scope: "login" });
