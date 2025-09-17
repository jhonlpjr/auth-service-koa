import { Context } from 'koa';
import { ACCESS_TOKEN } from '../constants/keys.constants';

export namespace TokenUtils {
    export function getTokenFromRequest(
        ctx: Context,
        tokenName: string = ACCESS_TOKEN,
        isBearer: boolean = true,
    ): string | undefined {
        // 1. Token explícito en body
        let token = (ctx.request.body as any)?.[tokenName];
        // 2. Si no, busca en cookie
        if (!token && ctx.state.cookies && ctx.state.cookies[tokenName]) {
            token = ctx.state.cookies[tokenName];
        }
        // 3. Si es accessToken o allowHeader=true, busca en header Authorization
        if (!token && (isBearer)) {
            token = extractBearerToken(ctx.headers.authorization);
        }
        return token;
    }
    export function extractBearerToken(authorizationHeader?: string): string | null {
        if (
            authorizationHeader &&
            typeof authorizationHeader === 'string' &&
            authorizationHeader.startsWith('Bearer ')
        ) {
            return authorizationHeader.replace('Bearer ', '').trim();
        }
        return null;
    }
}
