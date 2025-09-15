
import { Context, Next } from "koa";
import { Environment } from "../../infraestructure/config/environment.config";
import SecretsManagerService from "../../infraestructure/secrets/secret-manager.service";
import { ENV } from "../../utils/environments";

export async function superSecretKeyMiddleware(ctx: Context, next: Next) {
    const secretKey = ctx.headers["x-super-secret-key"];
    const secretName = Environment.get(ENV.SUPER_SECRET_KEY);
    const secretsManager = SecretsManagerService.getInstance();
    const expectedKey = await secretsManager.getSecret(secretName);
    if (!secretKey || secretKey !== expectedKey) {
        ctx.status = 403;
        ctx.body = { error: "Forbidden: Invalid super secret key" };
        return;
    }
    await next();
}
