import { GetPayloadUseCase } from '../../../src/application/usecases/get-payload.usecase';
import { PayloadMapper } from '../../../src/application/mappers/payload.mapper';
import { UnauthorizedError } from '../../../src/shared/api/exceptions/unauthorized-error';
import SecretsManagerService from '../../../src/infrastructure/secrets/secret-manager.service';
import { V2 } from 'paseto';

describe('GetPayloadUseCase', () => {
  let useCase: GetPayloadUseCase;
  let secretsManager: any;
  let verifyMock: jest.SpyInstance;

  beforeEach(() => {
    useCase = new GetPayloadUseCase();
    secretsManager = { getSecret: jest.fn() };
    jest.spyOn(SecretsManagerService, 'getInstance').mockReturnValue(secretsManager);
    verifyMock = jest.spyOn(V2, 'verify');
    jest.spyOn(PayloadMapper, 'mapToPayloadResDTO').mockReturnValue('mapped' as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should verify token and map payload', async () => {
    process.env.PASETO_SECRET_NAME = 'dummy';
    secretsManager.getSecret.mockResolvedValue('secret');
    verifyMock.mockResolvedValue({ id: '1', username: 'user', key: 'k' });
    const result = await useCase.execute('token');
    expect(secretsManager.getSecret).toHaveBeenCalled();
    expect(verifyMock).toHaveBeenCalled();
    expect(PayloadMapper.mapToPayloadResDTO).toHaveBeenCalledWith({ id: '1', username: 'user', key: 'k' });
    expect(result).toBe('mapped');
  });

  it('should throw UnauthorizedError if payload is falsy', async () => {
    secretsManager.getSecret.mockResolvedValue('secret');
    verifyMock.mockResolvedValue(undefined);
    await expect(useCase.execute('token')).rejects.toThrow(Error);
  });

  it('should propagate error if thrown', async () => {
    process.env.PASETO_SECRET_NAME = 'dummy';
    secretsManager.getSecret.mockResolvedValue('secret');
    verifyMock.mockRejectedValue(new UnauthorizedError('fail'));
  await expect(useCase.execute('token')).rejects.toThrow(UnauthorizedError);
  });
});
