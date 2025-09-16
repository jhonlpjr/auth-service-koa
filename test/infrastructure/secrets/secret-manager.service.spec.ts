import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import SecretsManagerService from "../../../src/infrastructure/secrets/secret-manager.service";
import { ENV } from "../../../src/shared/constants/environments.constants";

jest.mock("@aws-sdk/client-secrets-manager");

const mockSend = jest.fn();

(SecretsManagerClient as any).mockImplementation(() => ({
  send: mockSend,
}));

describe("SecretsManagerService", () => {
  beforeEach(() => {
    // Limpiar singleton para forzar nueva instancia en cada test
    // @ts-ignore
    SecretsManagerService.instance = undefined;
    jest.clearAllMocks();
    process.env[ENV.SECRETS_ENDPOINT] = "endpoint";
    process.env[ENV.AWS_REGION] = "region";
    process.env[ENV.AWS_ACCESS_KEY_ID] = "access";
    process.env[ENV.AWS_SECRET_ACCESS_KEY] = "secret";
  });

  it("should be a singleton", () => {
    const instance1 = SecretsManagerService.getInstance();
    const instance2 = SecretsManagerService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should call SecretsManagerClient with correct config", () => {
    SecretsManagerService.getInstance();
    expect(SecretsManagerClient).toHaveBeenCalledWith({
      endpoint: "endpoint",
      region: "region",
      credentials: {
        accessKeyId: "access",
        secretAccessKey: "secret",
      },
    });
  });

  it("should get secret value", async () => {
    mockSend.mockResolvedValue({ SecretString: "my-secret" });
    const service = SecretsManagerService.getInstance();
    const secret = await service.getSecret("secret-id");
    expect(mockSend).toHaveBeenCalledWith(expect.any(GetSecretValueCommand));
    expect(secret).toBe("my-secret");
  });

  it("should return empty string if SecretString is undefined", async () => {
    mockSend.mockResolvedValue({});
    const service = SecretsManagerService.getInstance();
    const secret = await service.getSecret("secret-id");
    expect(secret).toBe("");
  });
});
