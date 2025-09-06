import { injectable } from "inversify";
import logger from "../../utils/logger";
import { TYPES } from "../../infraestructure/providers/types";
import { AuthRepository } from "../../domain/repository/auth.repository";
import { inject } from "inversify";
import jwt from "jsonwebtoken";
import { UserPayload } from "../../domain/interfaces/user-payload.interface";
import bcrypt from "bcrypt";
import { UnauthorizedError } from "../../utils/error";

@injectable()
export class LoginUseCase {
  constructor(@inject(TYPES.AuthRepository) private authRepository: AuthRepository) {}
  
  async execute(username: string, password: string) {
    try {
        const user = await this.authRepository.getUserByUsername(username); // Cambiar a getUserByUsername
        if (!user) {
          throw new UnauthorizedError("Invalid credentials");
        }
  
        // Comparar el password ingresado con el hash almacenado
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new UnauthorizedError("Invalid credentials");
        }
        // Generar el token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, key: user.key } as UserPayload, // Payload
            process.env.JWT_SECRET || "default_secret", // Clave secreta
            { expiresIn: "1h" } // Opciones (expiración de 1 hora)
        );
        
        return {token};
                
    } catch (error) {
        logger.error(`Error during login: ${error}`);
        if (error instanceof UnauthorizedError) {
            throw error; // Propagar el error de credenciales inválidas
        }
        throw new Error("Login failed");
    }
  }
}
