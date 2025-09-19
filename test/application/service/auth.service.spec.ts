import { AuthService } from '../../../src/application/service/auth.service';
import { TYPES } from '../../../src/infrastructure/providers/types';
import { PayloadDTO } from '../../../src/application/dto/payload.dto';
import { LoggedUserDTO } from '../../../src/application/dto/logged-user.dto';
import { IssueTokensForUserIdUseCase } from '../../../src/application/usecases/issue-tokens-for-user-id.usecase';

describe('AuthService', () => {
  let authService: AuthService;
  let loginUseCase: any;
  let getPayloadUseCase: any;
  let refreshTokenUseCase: any;

  beforeEach(() => {
    loginUseCase = { execute: jest.fn() };
    getPayloadUseCase = { execute: jest.fn() };
    refreshTokenUseCase = { execute: jest.fn() };
    const mockUserRepository = {
      getUserById: jest.fn(),
      getUserByUsername: jest.fn(),
      createUser: jest.fn()
    };
    const mockIssueTokensForUserIdUseCase: jest.Mocked<IssueTokensForUserIdUseCase> = {
      execute: jest.fn()
    } as any;
    Object.setPrototypeOf(mockIssueTokensForUserIdUseCase, IssueTokensForUserIdUseCase.prototype);
    authService = new AuthService(
      loginUseCase,
      getPayloadUseCase,
      refreshTokenUseCase,
      mockUserRepository,
      mockIssueTokensForUserIdUseCase
    );
  });


    it('should call loginUseCase.execute and return result', async () => {
      const mockResult = new LoggedUserDTO(
        'access-token',
        'refresh-token',
        '1',
        3600,
        'scope',
        'aud'
      );
      loginUseCase.execute.mockResolvedValue(mockResult);
      const result = await authService.login('user', 'pass');
      expect(result).toBe(mockResult);
      expect(loginUseCase.execute).toHaveBeenCalledWith('user', 'pass');
    });

  it('should call getPayloadUseCase.execute and return result', async () => {
    const mockResult = new PayloadDTO('1', 'user', 'key');
    getPayloadUseCase.execute.mockResolvedValue(mockResult);
    const result = await authService.getPayload('token');
    expect(result).toBe(mockResult);
    expect(getPayloadUseCase.execute).toHaveBeenCalledWith('token');
  });


    it('should call refreshTokenUseCase.execute and return result', async () => {
      const mockResult = new LoggedUserDTO(
        'access-token',
        'refresh-token',
        '1',
        3600,
        'scope',
        'aud'
      );
      refreshTokenUseCase.execute.mockResolvedValue(mockResult);
      const result = await authService.refreshToken('1', 'refresh');
      expect(result).toBe(mockResult);
      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith('1', 'refresh');
    });

  it('should log and rethrow error on login', async () => {
    const error = new Error('fail');
    loginUseCase.execute.mockRejectedValue(error);
    await expect(authService.login('user', 'pass')).rejects.toThrow('fail');
  });

  it('should log and rethrow error on getPayload', async () => {
    const error = new Error('fail');
    getPayloadUseCase.execute.mockRejectedValue(error);
    await expect(authService.getPayload('token')).rejects.toThrow('fail');
  });

  it('should log and rethrow error on refreshToken', async () => {
    const error = new Error('fail');
    refreshTokenUseCase.execute.mockRejectedValue(error);
    await expect(authService.refreshToken('1', 'refresh')).rejects.toThrow('fail');
  });
});
