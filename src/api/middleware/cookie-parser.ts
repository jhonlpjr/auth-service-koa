// Koa middleware para parsear cookies (simple, sin firmar)
import { Context, Next } from 'koa';

export function cookieParser() {
  return async (ctx: Context, next: Next) => {
    const cookieHeader = ctx.headers.cookie;
    ctx.state.cookies = {};
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.split('=');
        ctx.state.cookies[name.trim()] = decodeURIComponent(rest.join('='));
      });
    }
    await next();
  };
}
