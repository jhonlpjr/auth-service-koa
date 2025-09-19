
import { Middleware } from 'koa';
import { timingSafeEqual } from 'crypto';
import { Environment } from '../../infrastructure/config/environment.config';
import SecretsManagerService from '../../infrastructure/secrets/secret-manager.service';
import type { TLSSocket } from 'tls';
import { ENV } from '../../shared/constants/environments.constants';
import { UnauthorizedError } from '../../shared/exceptions/unauthorized-error';
import { AUTH_MTLS_INVALID_SUBJECT_ERROR, AUTH_MTLS_REQUIRED_ERROR, CLIENT_AUTH_FAILED_DETAILS } from '../../shared/constants/errors.constants';
import { BFF_CLIENT_KEY, X_CLIENT_KEY } from '../../shared/constants/keys.constants';
import { TRUE_STRING } from '../../shared/constants/general.constants';

// Cache en memoria para evitar múltiples llamadas a AWS/localstack
let cachedBffClientKey: string | null = null;

export const clientAuth: Middleware = async (ctx, next) => {
    const clientKey = ctx.get(X_CLIENT_KEY);
    if (!cachedBffClientKey) {
        // Lee el nombre del secreto desde ENV (por compatibilidad, usa BFF_CLIENT_KEY como nombre)
        const secretName = BFF_CLIENT_KEY;
        const secretsManager = SecretsManagerService.getInstance();
        cachedBffClientKey = await secretsManager.getSecret(secretName);
    }
    const expected = cachedBffClientKey;
    if (!clientKey || !expected ||
        clientKey.length !== expected.length ||
        !timingSafeEqual(Buffer.from(clientKey), Buffer.from(expected))) {
        throw new UnauthorizedError(CLIENT_AUTH_FAILED_DETAILS)
    }
    // mTLS opcional
    if (Environment.get(ENV.AUTH_MTLS_ENABLED) === TRUE_STRING) {
        // Node.js: req.socket es TLSSocket en HTTPS
        const socket = ctx.req.socket as TLSSocket;
        if (!socket.authorized) {
            throw new UnauthorizedError(AUTH_MTLS_REQUIRED_ERROR);

        }
        const allowedSubject = Environment.get(ENV.BFF_TLS_SUBJECT);
        const cert = socket.getPeerCertificate();
        if (allowedSubject && cert.subject?.CN !== allowedSubject) {
            throw new UnauthorizedError(AUTH_MTLS_INVALID_SUBJECT_ERROR);
        }
    }
    await next();
};
