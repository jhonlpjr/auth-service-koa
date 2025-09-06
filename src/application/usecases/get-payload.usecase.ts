import { injectable } from "inversify";
import logger from "../../utils/logger";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../utils/error";

@injectable()
export class GetPayloadUseCase {
  constructor() { }

  async execute(token: string) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
      if (!payload) {
        throw new UnauthorizedError("Invalid token");
      }

      return payload;

    } catch (error) {
      if (error instanceof Error || error instanceof UnauthorizedError) {
        logger.error("Error during login:", error.message);
        throw error; // Propagar el error de credenciales inválidas
      } else {
        logger.error("Unknown error occurred");
        throw new Error("Unknown error occurred");
      }
    }
  }
}
