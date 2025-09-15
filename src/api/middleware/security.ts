import { Context, Next } from "koa";
import { HttpStatus } from "../../shared/enums/http-status.enum";

// Rellena con tus orígenes permitidos en PROD:
const defaultAllowlist = new Set<string>([
  // "https://tu-frontend.com",
  // "https://otra-url.com",
]);

export function securityHeaders() {
  return async (ctx: Context, next: Next) => {
    ctx.set("X-DNS-Prefetch-Control", "off");
    ctx.set("X-Frame-Options", "DENY");
    ctx.set("X-Content-Type-Options", "nosniff");
    ctx.set("Referrer-Policy", "no-referrer");
    ctx.set("X-XSS-Protection", "0");
    await next();
  };
}

export function simpleCors(allowlist: Set<string> = defaultAllowlist) {
  return async (ctx: Context, next: Next) => {
    const origin = ctx.get("Origin") || "";
    if (allowlist.has(origin)) {
      ctx.set("Access-Control-Allow-Origin", origin);
      ctx.set("Vary", "Origin");
      ctx.set("Access-Control-Allow-Credentials", "true");
      ctx.set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Request-Id");
      ctx.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      if (ctx.method === "OPTIONS") {
        ctx.status = HttpStatus.NO_CONTENT;
        return;
      }
    }
    await next();
  };
}
