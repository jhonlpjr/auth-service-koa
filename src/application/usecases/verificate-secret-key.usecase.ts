import { injectable } from "inversify";
import logger from "../../utils/logger";
import { TYPES } from "../../infraestructure/providers/types";
import { AuthRepository } from "../../domain/repository/auth.repository";
import { inject } from "inversify";
import jwt from "jsonwebtoken";
import { UserPayload } from "../../domain/interfaces/user-payload.interface";
import bcrypt from "bcrypt";

@injectable()
export class VerificateSecretKeyUseCase {
  constructor(@inject(TYPES.AuthRepository) private authRepository: AuthRepository) {}
  
  async execute(secret_key: string) {
    try {
        const user = await this.authRepository.getUserByKey(secret_key); // Cambiar a getUserByUsername
        if (!user) {
          throw new Error("Invalid credentials");
        }
        
        return {status: true};
                
    } catch (error) {
        logger.error("Error during login:", error);
        throw new Error("Login failed");
    }
  }
}
