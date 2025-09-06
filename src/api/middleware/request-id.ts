import { Context, Next } from "koa";
import { randomUUID } from "crypto";

export const requestIdHeader = "x-request-id";

export async function requestId(ctx: Context, next: Next) {
  const rid = ctx.get(requestIdHeader) || randomUUID();
  ctx.state.requestId = rid;
  ctx.set(requestIdHeader, rid);
  await next();
}