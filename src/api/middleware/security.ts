import { Context, Next } from "koa";
import { HttpStatus } from "../../shared/enums/http-status.enum";
import { HttpMethods } from "../../shared/enums/http-methods.enum";
import { HeaderKeys } from "../../shared/constants/headers.constants";
import { CONTENT_TYPE_OPTIONS, FRAME_OPTIONS, OFF_STRING, ORIGIN, REFERRER_POLICY, TRUE_STRING, XSS_PROTECTION } from "../../shared/constants/general.constants";

// Rellena con tus orígenes permitidos en PROD:
const defaultAllowlist = new Set<string>([
  // "https://tu-frontend.com",
  // "https://otra-url.com",
]);

export function securityHeaders() {
  return async (ctx: Context, next: Next) => {
  ctx.set(HeaderKeys.DNS_PREFETCH_CONTROL, OFF_STRING);
  ctx.set(HeaderKeys.FRAME_OPTIONS, FRAME_OPTIONS);
  ctx.set(HeaderKeys.CONTENT_TYPE_OPTIONS, CONTENT_TYPE_OPTIONS);
  ctx.set(HeaderKeys.REFERRER_POLICY, REFERRER_POLICY);
  ctx.set(HeaderKeys.XSS_PROTECTION, XSS_PROTECTION);
    await next();
  };
}

export function simpleCors(allowlist: Set<string> = defaultAllowlist) {
  return async (ctx: Context, next: Next) => {
    const origin = ctx.get(ORIGIN) || "";
    if (allowlist.has(origin)) {
      ctx.set(HeaderKeys.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
      ctx.set(HeaderKeys.VARY, ORIGIN);
      ctx.set(HeaderKeys.ACCESS_CONTROL_ALLOW_CREDENTIALS, TRUE_STRING);
      ctx.set(HeaderKeys.ACCESS_CONTROL_ALLOW_HEADERS, `${HeaderKeys.AUTHORIZATION}, ${HeaderKeys.CONTENT_TYPE}, ${HeaderKeys.X_REQUEST_ID}`);
      ctx.set(HeaderKeys.ACCESS_CONTROL_ALLOW_METHODS, `${HttpMethods.GET}, ${HttpMethods.POST}, ${HttpMethods.PUT}, ${HttpMethods.DELETE}, ${HttpMethods.PATCH}, ${HttpMethods.OPTIONS}`);
      if (ctx.method === HttpMethods.OPTIONS) {
        ctx.status = HttpStatus.NO_CONTENT;
        return;
      }
    }
    await next();
  };
}
