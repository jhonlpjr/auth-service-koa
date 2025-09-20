import { TokenUtils } from '../../../../src/shared/utils/token.utils';
import { LoginUseCase } from '../../../../src/application/usecases/auth/login.usecase';
import { UnauthorizedError } from '../../../../src/shared/exceptions/unauthorized-error';
import { LoggedUserDTO } from '../../../../src/application/dto/logged-user.dto';
import { Argon2PasswordHasher } from '../../../../src/infrastructure/crypto/argon-2-password-hasher';
import SecretsManagerService from '../../../../src/infrastructure/secrets/secret-manager.service';
// Ya no se usa PASETO
import crypto from 'crypto';
import { LOGIN_FAILED_ERROR } from '../../../../src/shared/constants/errors.constants';
jest.mock('crypto');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: any;
  let refreshTokenRepository: any;
  let secretsManager: any;

  beforeEach(() => {
    process.env.JWT_DEFAULT_AUD = 'test-aud';
    process.env.JWT_DEFAULT_SCOPE = 'test-scope';
    userRepository = { getUserByUsername: jest.fn() };
    refreshTokenRepository = { save: jest.fn() };
    useCase = new LoginUseCase(userRepository, refreshTokenRepository);
    secretsManager = { getSecret: jest.fn() };
    jest.spyOn(SecretsManagerService, 'getInstance').mockReturnValue(secretsManager);
    jest.spyOn(TokenUtils, 'signJwtToken').mockReturnValue('signed-token');
    jest.spyOn(Argon2PasswordHasher.prototype, 'verify').mockImplementation(function (p, u) {
      return Promise.resolve(p === 'hashed' && u === 'plain');
    });
    (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.alloc(64, 1));
    (crypto.randomUUID as jest.Mock).mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should login and return LoggedUserDTO', async () => {
    userRepository.getUserByUsername.mockResolvedValue({ id: '1', username: 'user', password: 'hashed', key: 'k' });
    secretsManager.getSecret.mockResolvedValue('secret');
    const result = await useCase.execute('user', 'plain');
    expect(userRepository.getUserByUsername).toHaveBeenCalledWith('user');
    expect(TokenUtils.signJwtToken).toHaveBeenCalled();
    expect(refreshTokenRepository.save).toHaveBeenCalled();
    expect(result).toBeInstanceOf(LoggedUserDTO);
    expect(result.accessToken).toBe('signed-token');
  });

  it('should throw UnauthorizedError if user not found', async () => {
    userRepository.getUserByUsername.mockResolvedValue(undefined);
    await expect(useCase.execute('user', 'plain')).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError if password invalid', async () => {
    userRepository.getUserByUsername.mockResolvedValue({ id: '1', username: 'user', password: 'hashed', key: 'k' });
    jest.spyOn(Argon2PasswordHasher.prototype, 'verify').mockResolvedValue(false);
    await expect(useCase.execute('user', 'wrong')).rejects.toThrow(UnauthorizedError);
  });

  it('should throw generic error on other failures', async () => {
    userRepository.getUserByUsername.mockRejectedValue(new Error('fail'));
    await expect(useCase.execute('user', 'plain')).rejects.toThrow(LOGIN_FAILED_ERROR);
  });
});
