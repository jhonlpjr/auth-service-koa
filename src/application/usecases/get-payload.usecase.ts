import { injectable } from "inversify";
import logger from "../../shared/utils/logger";
import { V2 } from "paseto";
import { UnauthorizedError } from "../../shared/api/exceptions/unauthorized-error";
import SecretsManagerService from "../../infrastructure/secrets/secret-manager.service";
import { ENV } from "../../shared/constants/environments.constants";
import { Environment } from "../../infrastructure/config/environment.config";
import { PayloadMapper } from "../mappers/payload.mapper";

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
      return PayloadMapper.mapToPayloadResDTO(payload);

    } catch (error: any) {
      if (error instanceof Error) {
        logger.error(`Error during login: ${error.message}`);
        throw error; // Propagar el error de credenciales inválidas
      } else {
        logger.error("Unknown error occurred");
        throw new Error("Unknown error occurred");
      }
    }
  }
}
