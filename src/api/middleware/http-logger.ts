import { Context, Next } from "koa";
import logger from "../../shared/utils/logger";

export async function httpLogger(ctx: Context, next: Next) {
  const start = Date.now();
  try {
    await next();
  } finally {
    const ms = Date.now() - start;
    const rid = ctx.state.requestId;
    logger.info(
      {
        requestId: rid,
        method: ctx.method,
        path: ctx.path,
        status: ctx.status,
        duration_ms: ms,
        ip: ctx.ip,
      },
      "request"
    );
  }
}
