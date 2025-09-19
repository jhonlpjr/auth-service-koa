import Koa from 'koa';
import logger from '../../shared/utils/logger';
import coreRouter from './core.routes';
import mfaRouter from './mfa.routes';

export function setRoutes(app: Koa) {
    // Registrar routers principales
    app.use(coreRouter.routes()).use(coreRouter.allowedMethods());
    app.use(mfaRouter.routes()).use(mfaRouter.allowedMethods());

    // Loggear rutas de ambos routers
    coreRouter.stack.forEach((route) => {
        logger.info(`[core] Route registered: [${route.methods.join(', ')}] ${route.path}`);
    });
    mfaRouter.stack.forEach((route) => {
        logger.info(`[mfa] Route registered: [${route.methods.join(', ')}] ${route.path}`);
    });
}
