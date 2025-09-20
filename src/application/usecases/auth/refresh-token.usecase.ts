

import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/providers/types";
import { sign } from 'jsonwebtoken';
import { UnauthorizedError } from '../../../shared/exceptions/unauthorized-error';
import crypto from 'crypto';
import { REFRESH_TOKEN_EXPIRATION_MS } from "../../../shared/constants/refresh-token.constants";
import { LoggedUserDTO } from "../../dto/logged-user.dto";
import { INVALID_TOKEN_ERROR, REFRESH_TOKEN_REUSE_DETECTED_ERROR, TOKEN_EXPIRED_ERROR } from "../../../shared/constants/errors.constants";
import { Environment } from "../../../infrastructure/config/environment.config";
import { ENV } from "../../../shared/constants/environments.constants";
import { BASE64, HEXADECIMAL, MILISECONDS_IN_A_SECOND, ONE_HOUR } from "../../../shared/constants/general.constants";
import { RefreshTokenRepository } from "../../ports/repositories/refresh-token.repository";


@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepository) private repo: RefreshTokenRepository
  ) { }

  async execute(userId: string, refreshToken: string, aud?: string, scope?: string) {
    // 1. Verificar el token opaco
    const record = await this.repo.verify(userId, refreshToken);
    if (!record) {
      throw new UnauthorizedError(INVALID_TOKEN_ERROR);
    }
    if (new Date(record.expires_at) < new Date()) {
      throw new UnauthorizedError(TOKEN_EXPIRED_ERROR);
    }
    // 2. Detectar reuse: si el token ya fue usado, revocar todos los tokens del usuario
    if (record.used) {
      await this.repo.revokeByUserId(userId);
      throw new UnauthorizedError(REFRESH_TOKEN_REUSE_DETECTED_ERROR);
    }
    // 3. Marcar el token como usado y rotado
    await this.repo.markAsUsed(record.jti);
    await this.repo.markAsRotated(record.jti);
    // 4. Emitir nuevo refresh token y access token (JWT)
    const payload = {
      id: userId,
      aud: aud || Environment.get(ENV.JWT_DEFAULT_AUD),
      scope: scope || Environment.get(ENV.JWT_DEFAULT_SCOPE),
    };
    const jwtSecret = Environment.get(ENV.JWT_SECRET);
    const token = sign(payload, jwtSecret, { expiresIn: ONE_HOUR });
    const newRefreshToken = crypto.randomBytes(BASE64).toString(HEXADECIMAL);
    const newJti = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);
    // 5. Guardar el nuevo refresh token con parent_jti para tracking de rotación
    await this.repo.save(userId, newRefreshToken, expiresAt, newJti, {}, record.jti);
    return new LoggedUserDTO(
      token,
      newRefreshToken,
      userId,
      Math.floor(REFRESH_TOKEN_EXPIRATION_MS / MILISECONDS_IN_A_SECOND),
      payload.scope,
      payload.aud
    );
  }

  async revokeByJti(jti: string) {
    await this.repo.revoke(jti);
  }

  async revokeByUserId(userId: string) {
    await this.repo.revokeByUserId(userId);
  }
}
