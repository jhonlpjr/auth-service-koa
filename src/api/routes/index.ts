import Router from 'koa-router';
import Koa from 'koa';
import logger from '../../shared/utils/logger';
import { loginRateLimit } from "../middleware/rate-limit";
import { AuthController } from '../controllers/auth.controller';
import { SuperUserController } from '../controllers/super-user.controller';
import { superSecretKeyMiddleware } from '../middleware/super-secret-key';
import { container } from '../../infrastructure/providers/container-config';
import { TYPES } from '../../infrastructure/providers/types';

const router = new Router({ prefix: '/api/v1' });

export function setRoutes(app: Koa) {
    const authController = container.get<AuthController>(TYPES.AuthController);
    const superUserController = container.get<SuperUserController>(TYPES.SuperUserController);
    router.get('/', async (ctx) => {
        ctx.body = 'API MS Auth';
    });

    router.post('/login', ...loginRateLimit, async (ctx, next) => { await authController.login(ctx); await next(); });
    router.post('/refresh-token', async (ctx, next) => { await authController.refreshToken(ctx); await next(); });
    router.post('/get-payload', async (ctx) => { await authController.getPayload(ctx) });
    router.post('/super/create-user', superSecretKeyMiddleware, async (ctx) => {
        await superUserController.createUser(ctx);
    });
    router.stack.forEach((route) => {
        logger.info(`Route registered: [${route.methods.join(', ')}] ${route.path}`);
    });
    app.use(router.routes()).use(router.allowedMethods());
}
