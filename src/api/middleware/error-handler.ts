import { Context, Next } from "koa";
import logger from "../utils/logger";

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err: any) {
    const rid = ctx.state.requestId;
    const status =
      err?.status ??
      (err?.name === "UnauthorizedError" ? 401 : 500);

    const message =
      status === 500 ? "Internal server error" : (err?.message || "Error");

    logger.error({ err, requestId: rid }, "Unhandled error");
    ctx.status = status;
    ctx.body = { error: message, requestId: rid };
  }
}
