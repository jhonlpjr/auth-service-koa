import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { Environment } from "../config/environment.config";
import { ENV } from "../../utils/environments";


class SecretsManagerService {
  private static instance: SecretsManagerService;
  private client: SecretsManagerClient;

  private constructor() {
    this.client = new SecretsManagerClient({
      endpoint: Environment.get(ENV.SECRETS_ENDPOINT),
      region: Environment.get(ENV.AWS_REGION),
      credentials: {
        accessKeyId: Environment.get(ENV.AWS_ACCESS_KEY_ID),
        secretAccessKey: Environment.get(ENV.AWS_SECRET_ACCESS_KEY),
      },
    });
  }

  static getInstance(): SecretsManagerService {
    if (!SecretsManagerService.instance) {
      SecretsManagerService.instance = new SecretsManagerService();
    }
    return SecretsManagerService.instance;
  }

  async getSecret(secretId: string): Promise<string> {
    const command = new GetSecretValueCommand({ SecretId: secretId });
    const response = await this.client.send(command);
    return response.SecretString || '';
  }
}

export default SecretsManagerService;