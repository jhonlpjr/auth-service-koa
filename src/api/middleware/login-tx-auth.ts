import { Middleware } from 'koa';
import { UnauthorizedError } from '../../shared/exceptions/unauthorized-error';
import { HeaderKeys } from '../../shared/constants/headers.constants';
import { VarTypes } from '../../shared/enums/var-types.enum';
import { INVALID_LOGIN_TX_ERROR, MISSING_OR_INVALID_LOGIN_TX_ERROR } from '../../shared/constants/errors.constants';
import redis from '../../infrastructure/providers/redis';
import { RedisConstants } from '../../shared/constants/redis.constants';

export const loginTxAuth: Middleware = async (ctx, next) => {
  const body = ctx.request.body as { login_tx?: string };
  const rawLoginTx = ctx.headers[HeaderKeys.X_LOGIN_TX] || body?.login_tx;
  const loginTx = Array.isArray(rawLoginTx) ? rawLoginTx[0] : rawLoginTx;
  if (!loginTx || typeof loginTx !== VarTypes.STRING) {
    throw new UnauthorizedError(MISSING_OR_INVALID_LOGIN_TX_ERROR);
  }
  // Buscar el userId asociado al loginTx en Redis
  const userId = await redis.get(`${RedisConstants.LOGIN_TX_PREFIX}${loginTx}`);
  if (!userId) {
    throw new UnauthorizedError(INVALID_LOGIN_TX_ERROR);
  }
  ctx.state.user = { id: userId };
  await next();
};
