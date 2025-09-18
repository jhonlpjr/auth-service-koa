import { injectable } from "inversify";
import logger from "../../shared/utils/logger";
import { TYPES } from "../../infrastructure/providers/types";
import { inject } from "inversify";
import { V2 } from "paseto";
import { } from "../../infrastructure/database/repositories/refresh-token.postgres.repository";
import crypto from "crypto";
import { Argon2PasswordHasher } from "../../infrastructure/crypto/argon-2-password-hasher";
import { UnauthorizedError } from "../../shared/api/exceptions/unauthorized-error";
import { ENV } from "../../shared/constants/environments.constants";
import SecretsManagerService from "../../infrastructure/secrets/secret-manager.service";
import { Environment } from "../../infrastructure/config/environment.config";
import { UserRepository } from "../../domain/repository/user.repository";
import { RefreshTokenRepository } from "../../domain/repository/refresh-token.repository";
import { LoggedUserDTO } from "../dto/logged-user.dto";
import { REFRESH_TOKEN_EXPIRATION_MS } from "../../shared/constants/refresh-token.constants";
import { INVALID_CREDENTIALS_ERROR, LOGIN_FAILED_DETAILS, LOGIN_FAILED_ERROR } from "../../shared/constants/errors.constants";
import { InternalServerError } from "../../shared/api/exceptions/internal-server-error";

@injectable()
export class LoginUseCase {
  constructor(@inject(TYPES.UserRepository) private userRepository: UserRepository, 
              @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: RefreshTokenRepository) { }

  async execute(username: string, password: string) {
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

      // Obtener la clave privada PASETO desde Secrets Manager
      const secretsManager = SecretsManagerService.getInstance();
      const privateKey = await secretsManager.getSecret(Environment.get(ENV.PASETO_SECRET_NAME));

      // Generar el token PASETO (V2.sign, clave privada)
      const payload = { id: user.id, username: user.username, key: user.key };
      const token = await V2.sign(payload, Buffer.from(privateKey));

      // Generar refresh token rotativo
      const refreshToken = crypto.randomBytes(64).toString('hex');
      const jti = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);
      await this.refreshTokenRepository.save(user.id, refreshToken, expiresAt, jti);

      return new LoggedUserDTO(token, refreshToken);

    } catch (error) {
      logger.error(LOGIN_FAILED_DETAILS.concat(JSON.stringify(error)));
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new InternalServerError(LOGIN_FAILED_ERROR);
    }
  }
}