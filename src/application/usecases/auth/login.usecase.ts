import { injectable } from "inversify";
import { TYPES } from "../../../infrastructure/providers/types";
import { inject } from "inversify";
import { TokenUtils } from '../../../shared/utils/token.utils';
import logger from "../../../shared/utils/logger";
import { } from "../../../infrastructure/adapters/repositories/postgres/refresh-token.postgres.repository";
import crypto from "crypto";
import { Argon2PasswordHasher } from "../../../infrastructure/crypto/argon-2-password-hasher";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error";
// Eliminados imports de PASETO y secrets
import { LoggedUserDTO } from "../../dto/logged-user.dto";
import { REFRESH_TOKEN_EXPIRATION_MS } from "../../../shared/constants/refresh-token.constants";
import { INVALID_CREDENTIALS_ERROR, LOGIN_FAILED_DETAILS, LOGIN_FAILED_ERROR } from "../../../shared/constants/errors.constants";
import { InternalServerError } from "../../../shared/exceptions/internal-server-error";
import { BASE64, HEXADECIMAL, MILISECONDS_IN_A_SECOND } from "../../../shared/constants/general.constants";
import { Environment } from "../../../infrastructure/config/environment.config";
import { ENV } from "../../../shared/constants/environments.constants";
import { RefreshTokenRepository } from "../../ports/repositories/refresh-token.repository";
import { UserRepository } from "../../ports/repositories/user.repository";

@injectable()
export class LoginUseCase {
  constructor(@inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: RefreshTokenRepository) { }

  async execute(username: string, password: string, aud?: string, scope?: string) {
    try {
      const user = await this.userRepository.getUserByUsername(username);
      if (!user) {
        throw new UnauthorizedError(INVALID_CREDENTIALS_ERROR);
      }

      // Comparar el password ingresado con el hash almacenado usando Argon2id
      const hasher = new Argon2PasswordHasher();
      const isPasswordValid = await hasher.verify(user.password, password);
      if (!isPasswordValid) {
        throw new UnauthorizedError(INVALID_CREDENTIALS_ERROR);
      }

      // Generar el token JWT (HS256) usando TokenUtils
      const payload = {
        id: user.id,
        username: user.username,
        key: user.key,
        aud: aud || Environment.get(ENV.JWT_DEFAULT_AUD),
        scope: scope || Environment.get(ENV.JWT_DEFAULT_SCOPE),
      };
      const token = TokenUtils.signJwtToken(payload);

      // Generar refresh token rotativo
      const refreshToken = crypto.randomBytes(BASE64).toString(HEXADECIMAL);
      const jti = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);
      // Guardar con meta opcional y parentJti null (primer token de la cadena)
      await this.refreshTokenRepository.save(user.id, refreshToken, expiresAt, jti, {}, null);

      return new LoggedUserDTO(
        token,
        refreshToken,
        user.id,
        Math.floor(REFRESH_TOKEN_EXPIRATION_MS / MILISECONDS_IN_A_SECOND),
        payload.scope,
        payload.aud
      );

    } catch (error) {
      logger.error(LOGIN_FAILED_DETAILS.concat(JSON.stringify(error)));
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new InternalServerError(LOGIN_FAILED_ERROR);
    }
  }
}