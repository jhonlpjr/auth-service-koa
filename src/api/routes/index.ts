import Router from 'koa-router';
import Koa from 'koa';
import { AuthController } from '../infraestructure/controllers/auth.controller';
import logger from '../../utils/logger';
import { loginRateLimit } from "../middleware/rate-limit";

const router = new Router({ prefix: '/api/v1' });

const authController = new AuthController();

export function setRoutes(app: Koa) {
    router.get('/', async (ctx) => {
        ctx.body = 'API MS Auth';
    });

    router.post('/login', loginRateLimit, async (ctx) => { await authController.login(ctx) });

    router.post('/get-payload', async (ctx) => { await authController.getPayload(ctx) });

    router.post('/verificate-secret-key', async (ctx) => { await authController.validateSecretKey(ctx) });
    
    router.stack.forEach((route) => {
        logger.info(`Route registered: [${route.methods.join(', ')}] ${route.path}`);
    });
    app.use(router.routes()).use(router.allowedMethods());
}
