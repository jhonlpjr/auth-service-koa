import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/providers/types";
import { V2 } from 'paseto';
import { UnauthorizedError } from '../../shared/api/exceptions/unauthorized-error';
import crypto from 'crypto';
import { ENV } from "../../shared/constants/environments.constants";
import SecretsManagerService from "../../infrastructure/secrets/secret-manager.service";
import { REFRESH_TOKEN_EXPIRATION_MS } from "../../shared/constants/refresh-token.constants";
import { RefreshTokenRepository } from "../../domain/repository/refresh-token.repository";
import { Environment } from "../../infrastructure/config/environment.config";
import { LoggedUserDTO } from "../dto/logged-user.dto";
import { INVALID_TOKEN_ERROR, TOKEN_EXPIRED_ERROR } from "../../shared/constants/errors.constants";

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepository) private repo: RefreshTokenRepository
  ) { }

  async execute(userId: string, refreshToken: string) {
    const record = await this.repo.verify(userId, refreshToken);
    if (!record) {
      throw new UnauthorizedError(INVALID_TOKEN_ERROR);
    }
    if (new Date(record.expires_at) < new Date()) {
      throw new UnauthorizedError(TOKEN_EXPIRED_ERROR);
    }
    await this.repo.revoke(record.jti);
    const secretsManager = SecretsManagerService.getInstance();
    const privateKey = await secretsManager.getSecret(Environment.get(ENV.PASETO_SECRET_NAME));
    const payload = { id: userId };
    const token = await V2.sign(payload, Buffer.from(privateKey));
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newJti = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);
    await this.repo.save(userId, newRefreshToken, expiresAt, newJti);
    return new LoggedUserDTO(token, newRefreshToken);
  }
}
