
import svgCaptcha from 'svg-captcha';
import redis from '../../infraestructure/providers/redis';
import { Context, Next } from 'koa';
import { ForbiddenError } from '../../shared/api/exceptions/forbidden-error';

const MAX_LOGIN_FAILS = 3;
const CAPTCHA_TTL = 300; // segundos

export async function captchaMiddleware(ctx: Context, next: Next) {
  const ip = ctx.ip || ctx.request.ip || 'unknown';
  const failKey = `login:fail:${ip}`;
  const fails = Number(await redis.get(failKey)) || 0;

  if (ctx.path === '/login' && fails >= MAX_LOGIN_FAILS) {
    const body = ctx.request.body as Record<string, any>;
    // Si no hay captcha en la request, devolver uno
    if (!body.captcha) {
      const captcha = svgCaptcha.create();
      await redis.set(`captcha:${ip}`, captcha.text, 'EX', CAPTCHA_TTL);
      throw new ForbiddenError('CAPTCHA required', { captcha: captcha.data });
    }
    // Validar captcha
    const expected = await redis.get(`captcha:${ip}`);
    if (!expected || body.captcha !== expected) {
      throw new ForbiddenError('Invalid CAPTCHA');
    }
    // Si es correcto, eliminar el captcha
    await redis.del(`captcha:${ip}`);
  }
  await next();
}

export async function registerLoginFail(ip: string) {
  const failKey = `login:fail:${ip}`;
  await redis.incr(failKey);
  await redis.expire(failKey, 600); // 10 minutos
}

export async function resetLoginFail(ip: string) {
  const failKey = `login:fail:${ip}`;
  await redis.del(failKey);
}
