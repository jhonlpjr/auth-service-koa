import { Context, Next } from "koa";

/**
 * Middleware global para setear automáticamente ctx.status según el campo `code` de la respuesta mapeada.
 * Si la respuesta tiene { code: number }, se usará como status HTTP final.
 */
export async function responseStatus(ctx: Context, next: Next) {
  await next();
  const body: any = ctx.body;
  if (body && typeof body.code === 'number') {
    ctx.status = body.code;
  }
}
