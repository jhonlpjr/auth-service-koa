import { injectable } from "inversify";
import logger from "../../utils/logger";
import { TYPES } from "../../infraestructure/providers/types";
import { AuthRepository } from "../../domain/repository/auth.repository";
import { inject } from "inversify";
import { V2 } from "paseto";
import { UserPayload } from "../../domain/interfaces/user-payload.interface";
import { RefreshTokenRepository } from "../../infraestructure/database/repositories/refresh-token.postgres.repository";
import crypto from "crypto";
import { Argon2PasswordHasher } from "../../infraestructure/crypto/argon-2-password-hasher";
import { UnauthorizedError } from "../../utils/error";
import { ENV } from "../../utils/environments";
import SecretsManagerService from "../../infraestructure/secrets/secret-manager.service";
import { Environment } from "../../infraestructure/config/environment.config";
import { UserRepository } from "../../domain/repository/user.repository";

@injectable()
export class LoginUseCase {
  constructor(@inject(TYPES.UserRepository) private userRepository: UserRepository) {}

  async execute(username: string, password: string) {
    const refreshTokenRepo = new RefreshTokenRepository();
    try {
      const user = await this.userRepository.getUserByUsername(username);
      if (!user) {
        throw new UnauthorizedError("Invalid credentials");
      }

      // Comparar el password ingresado con el hash almacenado usando Argon2id
      const hasher = new Argon2PasswordHasher();
      const isPasswordValid = await hasher.verify(user.password, password);
      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid credentials");
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
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 días
      await refreshTokenRepo.save(user.id, refreshToken, expiresAt, jti);

      return { token, refreshToken };

    } catch (error) {
      logger.error(`Error during login: ${error}`);
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new Error("Login failed");
    }
  }
}