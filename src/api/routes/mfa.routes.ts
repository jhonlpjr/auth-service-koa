import Router from 'koa-router';
import { MfaController } from '../controllers/mfa.controller';
import { clientAuth } from '../middleware/client-auth';
import { userAuth } from '../middleware/user-auth';
import { loginTxAuth } from '../middleware/login-tx-auth';

const mfaController = new MfaController();
const mfaRouter = new Router({ prefix: '/api/v1/mfa' });

mfaRouter.post('/totp/setup', userAuth, clientAuth, async ctx => mfaController.setupTotp(ctx));
mfaRouter.post('/totp/activate', userAuth, clientAuth, async ctx => mfaController.activateTotp(ctx));
mfaRouter.post('/verify', loginTxAuth, clientAuth, async ctx => mfaController.verifyTotp(ctx));
mfaRouter.get('/factors', clientAuth, async ctx => mfaController.listFactors(ctx));
mfaRouter.post('/recovery/verify', loginTxAuth, clientAuth, async ctx => mfaController.verifyRecovery(ctx));

export default mfaRouter;
