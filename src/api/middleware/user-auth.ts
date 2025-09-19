import { Middleware } from 'koa';
import { JsonWebTokenError, TokenExpiredError, verify } from 'jsonwebtoken';
import { UnauthorizedError } from '../../shared/exceptions/unauthorized-error';
import { HeaderKeys } from '../../shared/constants/headers.constants';
import { TokenUtils } from '../../shared/utils/token.utils';
import { Environment } from '../../infrastructure/config/environment.config';
import { ENV } from '../../shared/constants/environments.constants';
import { INVALID_OR_EXPIRED_TOKEN_ERROR } from '../../shared/constants/errors.constants';

export const userAuth: Middleware = async (ctx, next) => {
  const authHeader = ctx.get(HeaderKeys.AUTHORIZATION);
  const token = TokenUtils.extractBearerToken(authHeader);
  try {
    const jwtSecret = Environment.get(ENV.JWT_SECRET);
    const payload = verify(token, jwtSecret);
    ctx.state.user = payload;
    await next(); 
  } catch (err: any) {
    if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
      throw new UnauthorizedError(INVALID_OR_EXPIRED_TOKEN_ERROR);
    }
    throw err;
  }
};
