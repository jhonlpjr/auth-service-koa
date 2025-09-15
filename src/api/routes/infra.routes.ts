import Router from 'koa-router';
import { metricsEndpoint } from '../middleware/metrics';
import Koa from 'koa';

const infraRouter = new Router();

infraRouter.get('/metrics', metricsEndpoint);
infraRouter.get('/healthz', async (ctx) => {
  ctx.status = 200;
  ctx.body = { status: 'ok' };
});
infraRouter.get('/readyz', async (ctx) => {
  ctx.status = 200;
  ctx.body = { ready: true };
});

export function setInfraRoutes(app: Koa) {
  app.use(infraRouter.routes()).use(infraRouter.allowedMethods());
}
