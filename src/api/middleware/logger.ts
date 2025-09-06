import pino from 'pino';
import { Context, Next } from 'koa';

const logger = pino();

export const loggerMiddleware = async (ctx: Context, next: Next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  logger.info({
    method: ctx.method,
    url: ctx.url,
    status: ctx.status,
    responseTime: `${ms}ms`,
  });
};