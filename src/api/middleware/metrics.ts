import client from 'prom-client';
import { Context, Next } from 'koa';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

export async function metricsMiddleware(ctx: Context, next: Next) {
  await next();
  httpRequestCounter.inc({
    method: ctx.method,
    route: ctx.path,
    status: ctx.status
  });
}

export function metricsEndpoint(ctx: Context) {
  ctx.set('Content-Type', client.register.contentType);
  ctx.body = client.register.metrics();
}
