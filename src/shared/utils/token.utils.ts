import { Context } from 'koa';
import { ACCESS_TOKEN } from '../constants/keys.constants';
import { UnauthorizedError } from '../api/exceptions/unauthorized-error';
import { V2 } from 'paseto';

export namespace TokenUtils {
    export function getTokenFromRequest(
        ctx: Context,
        tokenName: string = ACCESS_TOKEN,
        isBearer: boolean = true,
    ): string | undefined {
        // 1. Token explícito en body
        let token = (ctx.request.body as any)?.[tokenName];
        if (token) {
            return token;
        }
        // 2. Si no, busca en cookie
        if (!token && ctx.state.cookies && ctx.state.cookies[tokenName]) {
            token = ctx.state.cookies[tokenName];
        }
        if (token) {
            return token;
        }
        // 3. Si es accessToken o allowHeader=true, busca en header Authorization
        if ((isBearer) && ctx.headers.authorization) {
            const bearer = extractBearerToken(ctx.headers.authorization);
            if (bearer) {
                return bearer;
            }
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
    export async function verifyPasetoToken(token: string, publicKey: Buffer | string): Promise<any> {
        try {
            // Si usas claims estándar como exp, puedes validar aquí
            const payload = await V2.verify(token, publicKey);
            // Si quieres controlar expiración manualmente:
            if (
                payload.exp &&
                (typeof payload.exp === 'string' || typeof payload.exp === 'number') &&
                Date.now() > new Date(payload.exp).getTime()
            ) {
                throw new UnauthorizedError('Token expired');
            }
            return payload;
        } catch (err: any) {
            if (err.message && err.message.toLowerCase().includes('expired')) {
                throw new UnauthorizedError('Token expired');
            }
            throw new UnauthorizedError('Invalid or malformed token');
        }
    }
}
