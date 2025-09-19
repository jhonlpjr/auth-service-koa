import { Context, Next } from "koa";
import { Environment } from "../../infrastructure/config/environment.config";
import SecretsManagerService from "../../infrastructure/secrets/secret-manager.service";
import { ENV } from "../../shared/constants/environments.constants";
import { ForbiddenError } from "../../shared/exceptions/forbidden-error";
import { HeaderKeys } from "../../shared/constants/headers.constants";
import { SUPER_SECRET_KEY_INVALID_ERROR } from "../../shared/constants/errors.constants";

export async function superSecretKeyMiddleware(ctx: Context, next: Next) {
    const secretKey = ctx.headers[HeaderKeys.X_SUPER_SECRET_KEY];
    const secretName = Environment.get(ENV.SUPER_SECRET_KEY);
    const secretsManager = SecretsManagerService.getInstance();
    const expectedKey = await secretsManager.getSecret(secretName);
    if (!secretKey || secretKey !== expectedKey) {
        throw new ForbiddenError(SUPER_SECRET_KEY_INVALID_ERROR);
    }
    await next();
}
