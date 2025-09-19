
import { SignOptions, sign } from 'jsonwebtoken';
import { importPKCS8 } from 'jose';
import SecretsManagerService from '../../infrastructure/secrets/secret-manager.service';
import { DEFAULT_TOKEN_EXPIRATION } from '../../shared/constants/general.constants';


export class JwtService {
  private privateKeyPromise: Promise<CryptoKey>;
  kid: string;
  alg: string;
  iss: string;
  aud: string;
  scope: string;
  ttl: number;

  constructor() {
    this.kid = 'main';
    this.alg = 'ES256';
    this.iss = process.env.JWT_ISS || '';
    this.aud = process.env.JWT_DEFAULT_AUD || '';
    this.scope = process.env.JWT_DEFAULT_SCOPE || '';
    this.ttl = Number(process.env.JWT_TTL_SECONDS) || DEFAULT_TOKEN_EXPIRATION;
    // Carga la clave privada EC desde Secrets Manager
    this.privateKeyPromise = (async () => {
      const secretsManager = SecretsManagerService.getInstance();
      const privateKeyPem = await secretsManager.getSecret('ec-private-key');
      if (!privateKeyPem) throw new Error('EC private key not found in Secrets Manager');
      return importPKCS8(privateKeyPem, 'ES256');
    })();
  }

  async signJwt(sub: string, extra: any = {}, aud?: string, scope?: string) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.iss,
      aud: aud || this.aud,
      sub,
      scope: scope || this.scope,
      iat: now,
      nbf: now,
      exp: now + this.ttl,
      ...extra,
    };
    const privateKey = await this.privateKeyPromise;
    // Usar la librería jose para firmar JWT con la clave EC
    const { SignJWT } = await import('jose');
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: this.alg, typ: 'JWT', kid: this.kid })
      .setIssuedAt()
      .setNotBefore(now)
      .setExpirationTime(this.ttl + 's')
      .sign(privateKey);
  }
}
