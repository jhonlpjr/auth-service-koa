import { Context, Next } from "koa";
import logger from "../../shared/utils/logger";
import { ResponseMapper } from "../../shared/mappers/response.mapper";
import { HttpStatus } from "../../shared/enums/http-status.enum";

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err: any) {
    const rid = ctx.state.requestId;
    logger.error({
      msg: "Unhandled error",
      error: err,
      stack: err?.stack,
      requestId: rid
    });
    // Si es una excepción HTTP tipada, usar su statusCode
    const status = typeof err?.statusCode === 'number' ? err.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
    ctx.status = status;
    ctx.body = {
      ...ResponseMapper.errorResponse(err),
      requestId: rid
    };
  }
}
