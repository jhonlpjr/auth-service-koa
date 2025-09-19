import SecretsManagerService from '../secrets/secret-manager.service';

/**
 * Inicializa los secretos críticos de la app y los guarda en process.env
 * para que sean reutilizables y no se hagan múltiples llamadas a Secrets Manager.
 */
export async function initSecrets() {
  if (!process.env.JWT_SECRET) {
    const secretsManager = SecretsManagerService.getInstance();
    const jwtSecret = await secretsManager.getSecret('jwt-secret');
    process.env.JWT_SECRET = jwtSecret;
  }
}
