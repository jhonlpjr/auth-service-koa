import { Context } from 'koa';

/**
 * Genera un token CSRF aleatorio y lo setea como cookie XSRF-TOKEN en la respuesta.
 * @param ctx Koa context
 * @returns El token generado
 */
export function setCsrfCookie(ctx: Context): string {
  const csrfToken = require('crypto').randomBytes(32).toString('hex');
  ctx.cookies.set('XSRF-TOKEN', csrfToken, {
    httpOnly: false,
    secure: false, // Cambia a true en producción si usas HTTPS
    sameSite: 'lax',
    path: '/',
  });
  return csrfToken;
}
