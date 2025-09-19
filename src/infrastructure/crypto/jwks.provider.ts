
import { EC_PUBLIC_KEY } from '../../shared/constants/keys.constants';
import SecretsManagerService from '../secrets/secret-manager.service';
import { importSPKI, exportJWK } from 'jose';

// Obtiene la clave pública EC desde AWS Secrets Manager y la expone como JWKS
export async function getJwks() {
    const secretsManager = SecretsManagerService.getInstance();
    const publicKeyPem = await secretsManager.getSecret(EC_PUBLIC_KEY);
    if (!publicKeyPem) return { keys: [] };
    // Importa la clave pública PEM y la convierte a JWK
    const key = await importSPKI(publicKeyPem, 'ES256');

    const jwk = await exportJWK(key);
    jwk.alg = 'ES256';
    jwk.use = 'sig';
    jwk.kid = 'main';
    return { keys: [jwk] };
}
