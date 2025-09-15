import { RefreshTokenRepository } from '../../infraestructure/database/repositories/refresh-token.postgres.repository';
import { V2 } from 'paseto';
import crypto from 'crypto';

export class RefreshTokenUseCase {
  private repo = new RefreshTokenRepository();

  async execute(userId: string, refreshToken: string) {
    // Verificar el refresh token
    const record = await this.repo.verify(userId, refreshToken);
    if (!record || new Date(record.expires_at) < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }
    // Rotar: eliminar el anterior
    await this.repo.revoke(record.jti);
    // Generar nuevo access token y refresh token
    const privateKey = process.env.PASETO_PRIVATE_KEY || 'default_paseto_private_key';
    const payload = { id: userId };
    const token = await V2.sign(payload, Buffer.from(privateKey));
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newJti = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await this.repo.save(userId, newRefreshToken, expiresAt, newJti);
    return { token, refreshToken: newRefreshToken };
  }
}
