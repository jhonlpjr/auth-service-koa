
import { Context, Next } from "koa";
import redis from '../../infrastructure/providers/redis';
import { HttpStatus } from "../../shared/enums/http-status.enum";
import { TooManyRequestsError } from '../../shared/exceptions/too-many-requests-error';
import { VarTypes } from "../../shared/enums/var-types.enum";
import { TOO_MANY_REQUESTS_ERROR } from "../../shared/constants/errors.constants";
import { HeaderKeys } from "../../shared/constants/headers.constants";
import { RedisConstants } from "../../shared/constants/redis.constants";
import { MILISECONDS_IN_A_SECOND } from "../../shared/constants/general.constants";

function getKey(ip: string, username?: string, scope?: string) {
  if (username) return `${scope || RedisConstants.LOGIN_SCOPE}:${RedisConstants.USER_PREFIX}${username}`;
  return `${scope || RedisConstants.GLOBAL_SCOPE}:${RedisConstants.IP_PREFIX}${ip}`;
}

export function rateLimitRedis(opts?: { windowMs?: number; max?: number; scope?: string; byUsername?: boolean }) {
  const windowMs = opts?.windowMs ?? RedisConstants.WINDOWS_MS;
  const max = opts?.max ?? RedisConstants.MAX_TWENTY_REQUESTS;
  const scope = opts?.scope ?? RedisConstants.GLOBAL_SCOPE;
  const byUsername = opts?.byUsername ?? false;

  return async (ctx: Context, next: Next) => {
    const ip = ctx.ip || ctx.request.ip || RedisConstants.UNKNOWN_IP;
    let username: string | undefined;
    const body = ctx.request.body as Record<string, any>;
    if (byUsername && body && typeof body.username === VarTypes.STRING) {
      username = body.username;
    }
    const key = getKey(ip, username, scope);
    const ttl = Math.ceil(windowMs / MILISECONDS_IN_A_SECOND);
    let count = await redis.incr(key);
    if (count === RedisConstants.ONE_REQUEST) {
      await redis.expire(key, ttl);
    }
    if (count > max) {
      const retryAfter = await redis.ttl(key);
      ctx.set(HeaderKeys.RETRY_AFTER, String(retryAfter));
      throw new TooManyRequestsError(TOO_MANY_REQUESTS_ERROR, { retryAfter });
    }
    await next();
  };
}

// Rate limit híbrido para login: por IP y por username
export const loginRateLimit = [
  rateLimitRedis({ windowMs: RedisConstants.WINDOWS_MS, max: RedisConstants.MAX_TEN_REQUESTS, scope: RedisConstants.LOGIN_SCOPE }),
  rateLimitRedis({ windowMs: RedisConstants.WINDOWS_MS, max: RedisConstants.MAX_TEN_REQUESTS, scope: RedisConstants.LOGIN_SCOPE, byUsername: true })
];
