import { Context } from 'koa';
import { ACCESS_TOKEN } from '../constants/keys.constants';
import { UnauthorizedError } from '../exceptions/unauthorized-error';
import { sign, verify, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

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
    export function validateBearerHeader(authHeader?: string): void {
        if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Missing or invalid Authorization header');
        }
    }
    export function extractBearerToken(authorizationHeader: string): string {
        validateBearerHeader(authorizationHeader);
        return authorizationHeader.replace('Bearer ', '').trim();
    }
    export function signJwtToken(payload: object, options?: object): string {
        return sign(payload, JWT_SECRET, { expiresIn: '1h', ...options });
    }

    export function verifyJwtToken(token: string): JwtPayload {
        try {
            return verify(token, JWT_SECRET) as JwtPayload;
        } catch (err: any) {
            if (err.message && err.message.toLowerCase().includes('expired')) {
                throw new UnauthorizedError('Token expired');
            }
            throw new UnauthorizedError('Invalid or malformed token');
        }
    }
}
