import { injectable } from "inversify";
import logger from "../../utils/logger";
import { V2 } from "paseto";
import { UnauthorizedError } from "../../utils/error";
import SecretsManagerService from "../../infraestructure/secrets/secret-manager.service";
import { ENV } from "../../utils/environments";
import { Environment } from "../../infraestructure/config/environment.config";

@injectable()
export class GetPayloadUseCase {
  constructor() { }

  async execute(token: string) {
    try {
      const secretsManager = SecretsManagerService.getInstance();
      const privateKey = await secretsManager.getSecret(Environment.get(ENV.PASETO_SECRET_NAME));
      const payload = await V2.verify(token, Buffer.from(privateKey));
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
