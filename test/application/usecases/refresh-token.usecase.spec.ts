// Mock paseto antes de cualquier import
jest.mock('paseto', () => ({
  V2: {
    sign: jest.fn().mockResolvedValue('signed-token'),
    verify: jest.fn().mockResolvedValue({ id: '1', username: 'user', key: 'k' }),
  }
}));
import { V2 } from "paseto";
import { LoggedUserDTO } from "../../../src/application/dto/logged-user.dto";
import { RefreshTokenUseCase } from "../../../src/application/usecases/refresh-token.usecase";
import SecretsManagerService from "../../../src/infrastructure/secrets/secret-manager.service";
import crypto from 'crypto';
jest.mock('crypto');

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let repo: any;
  let secretsManager: any;

  beforeEach(() => {
    process.env.PASETO_SECRET_NAME = 'dummy-secret';
    repo = {
      verify: jest.fn(),
      revoke: jest.fn(),
      save: jest.fn()
    };
    useCase = new RefreshTokenUseCase(repo);
    secretsManager = { getSecret: jest.fn() };
    jest.spyOn(SecretsManagerService, 'getInstance').mockReturnValue(secretsManager);
    jest.spyOn(V2, 'sign').mockResolvedValue('signed-token');
    (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.alloc(64, 1));
    (crypto.randomUUID as jest.Mock).mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should verify, revoke, save and return LoggedUserDTO', async () => {
    const userId = 'user1';
    const refreshToken = 'refresh';
    const record = { jti: 'jti', expires_at: new Date(Date.now() + 10000) };
    repo.verify.mockResolvedValue(record);
    secretsManager.getSecret.mockResolvedValue('secret');
    const result = await useCase.execute(userId, refreshToken);
    expect(repo.verify).toHaveBeenCalledWith(userId, refreshToken);
    expect(repo.revoke).toHaveBeenCalledWith('jti');
    expect(secretsManager.getSecret).toHaveBeenCalled();
    expect(V2.sign).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result).toBeInstanceOf(LoggedUserDTO);
    expect(result.token).toBe('signed-token');
  });

  it('should throw error if record is missing', async () => {
    repo.verify.mockResolvedValue(undefined);
    await expect(useCase.execute('user1', 'refresh')).rejects.toThrow('Invalid or expired refresh token');
  });

  it('should throw error if record is expired', async () => {
    repo.verify.mockResolvedValue({ jti: 'jti', expires_at: new Date(Date.now() - 10000) });
    await expect(useCase.execute('user1', 'refresh')).rejects.toThrow('Invalid or expired refresh token');
  });
});
