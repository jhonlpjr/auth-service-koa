// Mock paseto antes de cualquier import
jest.mock('paseto', () => ({
  V2: {
    sign: jest.fn().mockResolvedValue('signed-token'),
    verify: jest.fn().mockResolvedValue({ id: '1', username: 'user', key: 'k' }),
  }
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('signed-jwt')
}));
import { LoggedUserDTO } from "../../../../src/application/dto/logged-user.dto";
import { RefreshTokenUseCase } from "../../../../src/application/usecases/auth/refresh-token.usecase";
// Ya no se usa SecretsManagerService
import crypto from 'crypto';
import { TOKEN_EXPIRED_ERROR } from "../../../../src/shared/constants/errors.constants";
jest.mock('crypto');

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let repo: any;
  let secretsManager: any;

  beforeEach(() => {
  process.env.PASETO_SECRET_NAME = 'dummy-secret';
  process.env.JWT_DEFAULT_AUD = 'test-aud';
  process.env.JWT_DEFAULT_SCOPE = 'test-scope';
  process.env.JWT_SECRET = 'test-secret';
    repo = {
      verify: jest.fn(),
      revoke: jest.fn(),
      save: jest.fn(),
      markAsUsed: jest.fn(),
      markAsRotated: jest.fn(),
      revokeByUserId: jest.fn()
    };
    useCase = new RefreshTokenUseCase(repo);
    (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.alloc(64, 1));
    (crypto.randomUUID as jest.Mock).mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should rotate refresh token and mark as used/rotated', async () => {
    const userId = 'user1';
    const refreshToken = 'refresh';
    const record = { jti: 'jti', expires_at: new Date(Date.now() + 10000), used: false };
    repo.verify.mockResolvedValue(record);
    repo.markAsUsed = jest.fn();
    repo.markAsRotated = jest.fn();
  // Ya no se usa secretsManager.getSecret
    repo.save.mockResolvedValue(undefined);
    const result = await useCase.execute(userId, refreshToken);
    expect(repo.verify).toHaveBeenCalledWith(userId, refreshToken);
    expect(repo.markAsUsed).toHaveBeenCalledWith('jti');
    expect(repo.markAsRotated).toHaveBeenCalledWith('jti');
    expect(repo.save).toHaveBeenCalledWith(
      userId,
      expect.any(String),
      expect.any(Date),
      expect.any(String),
      {},
      'jti'
    );
    expect(result).toBeInstanceOf(LoggedUserDTO);
  expect(result.accessToken).toBe('signed-jwt');
  });

  it('should revoke all tokens and throw on reuse detection', async () => {
    const userId = 'user1';
    const refreshToken = 'refresh';
    const record = { jti: 'jti', expires_at: new Date(Date.now() + 10000), used: true };
    repo.verify.mockResolvedValue(record);
    repo.revokeByUserId = jest.fn();
    try {
      await useCase.execute(userId, refreshToken);
      fail('Should have thrown');
    } catch (err: any) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Unauthorized');
      expect(err.details).toBe('Refresh token reuse detected. All sessions revoked.');
    }
    expect(repo.revokeByUserId).toHaveBeenCalledWith(userId);
  });

  it('should throw error if record is missing', async () => {
    repo.verify.mockResolvedValue(undefined);
    await expect(useCase.execute('user1', 'refresh')).rejects.toThrow('Unauthorized');
  });

  it('should throw error if record is expired', async () => {
    repo.verify.mockResolvedValue({ jti: 'jti', expires_at: new Date(Date.now() - 10000) });
    try {
      await useCase.execute('user1', 'refresh');
      // Si no lanza error, falla el test
      fail('Should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Unauthorized');
      // Verifica que el details coincida con TOKEN_EXPIRED_ERROR
      expect(err.details).toBeDefined();
      expect(err.details).toContain(TOKEN_EXPIRED_ERROR);
    }
  });
});
