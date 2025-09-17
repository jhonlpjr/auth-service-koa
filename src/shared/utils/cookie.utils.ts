import { Context } from 'koa';
import { CookieOptions } from '../interfaces/cookies';

export namespace CookieUtils {
  export function setCookie(
    ctx: Context,
    name: string,
    value: string,
    options: CookieOptions = {}
  ) {
    ctx.cookies.set(name, value, {
      httpOnly: options.httpOnly ?? true,
      secure: options.secure ?? (process.env.NODE_ENV === 'production'),
      sameSite: options.sameSite ?? 'lax',
      domain: options.domain,
      maxAge: options.maxAge,
      path: options.path ?? '/',
    });
  }
}

