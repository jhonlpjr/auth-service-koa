import Router from 'koa-router';
import { AuthController } from '../controllers/auth.controller';
import { SuperUserController } from '../controllers/super-user.controller';
import { loginRateLimit } from "../middleware/rate-limit";
import { superSecretKeyMiddleware } from '../middleware/super-secret-key';
import { clientAuth } from '../middleware/client-auth';
import { container } from '../../infrastructure/providers/container-config';
import { TYPES } from '../../infrastructure/providers/types';

const coreRouter = new Router({ prefix: '/api/v1' });

const authController = container.get<AuthController>(TYPES.AuthController);
const superUserController = container.get<SuperUserController>(TYPES.SuperUserController);

coreRouter.get('/', async (ctx) => {
    ctx.body = 'API MS Auth';
});

coreRouter.post('/login', clientAuth, ...loginRateLimit, async (ctx, next) => { await authController.login(ctx); await next(); });
coreRouter.post('/refresh-token', clientAuth, async (ctx, next) => { await authController.refreshToken(ctx); await next(); });
coreRouter.post('/revoke', clientAuth, async (ctx) => { await authController.revoke(ctx); });
coreRouter.get('/.well-known/jwks.json', async (ctx) => { await authController.jwks(ctx); });
// coreRouter.post('/introspect', clientAuth, async (ctx) => { await authController.introspect(ctx); }); // opcional
// coreRouter.post('/get-payload', async (ctx) => { await authController.getPayload(ctx) }); // solo si es necesario
coreRouter.post('/super/create-user', superSecretKeyMiddleware, async (ctx) => {
    await superUserController.createUser(ctx);
});

export default coreRouter;
