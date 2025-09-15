

import { Context, Next } from "koa";
import { Environment } from "../../infraestructure/config/environment.config";
import SecretsManagerService from "../../infraestructure/secrets/secret-manager.service";
import { ENV } from "../../shared/constants/environments.constants";
import { ForbiddenError } from "../../shared/api/exceptions/forbidden-error";

export async function superSecretKeyMiddleware(ctx: Context, next: Next) {
    const secretKey = ctx.headers["x-super-secret-key"];
    const secretName = Environment.get(ENV.SUPER_SECRET_KEY);
    const secretsManager = SecretsManagerService.getInstance();
    const expectedKey = await secretsManager.getSecret(secretName);
    if (!secretKey || secretKey !== expectedKey) {
        throw new ForbiddenError("Invalid super secret key");
    }
    await next();
}
