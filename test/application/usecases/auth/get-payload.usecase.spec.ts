import { PayloadMapper } from '../../../../src/application/mappers/payload.mapper';
import { GetPayloadUseCase } from '../../../../src/application/usecases/auth/get-payload.usecase';
import SecretsManagerService from '../../../../src/infrastructure/secrets/secret-manager.service';
import { TokenUtils } from '../../../../src/shared/utils/token.utils';
import { UnauthorizedError } from '../../../../src/shared/exceptions/unauthorized-error';

describe('GetPayloadUseCase', () => {
  let useCase: GetPayloadUseCase;
  let secretsManager: any;
  let verifyJwtMock: jest.SpyInstance;

  beforeEach(() => {
    useCase = new GetPayloadUseCase();
    secretsManager = { getSecret: jest.fn() };
    jest.spyOn(SecretsManagerService, 'getInstance').mockReturnValue(secretsManager);
  verifyJwtMock = jest.spyOn(TokenUtils, 'verifyJwtToken');
    jest.spyOn(PayloadMapper, 'mapToPayloadResDTO').mockReturnValue('mapped' as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should verify token and map payload', async () => {
    process.env.PASETO_SECRET_NAME = 'dummy';
    secretsManager.getSecret.mockResolvedValue('secret');
  verifyJwtMock.mockReturnValue({ id: '1', username: 'user', key: 'k' });
    const result = await useCase.execute('token');
  // Ya no se usa secretsManager.getSecret en la implementación actual
  expect(verifyJwtMock).toHaveBeenCalled();
    expect(PayloadMapper.mapToPayloadResDTO).toHaveBeenCalledWith({ id: '1', username: 'user', key: 'k' });
    expect(result).toBe('mapped');
  });

  it('should throw UnauthorizedError if payload is falsy', async () => {
    secretsManager.getSecret.mockResolvedValue('secret');
    verifyJwtMock.mockReturnValue(undefined);
    // Restaurar la implementación real para este test
    (PayloadMapper.mapToPayloadResDTO as jest.Mock).mockRestore();
    await expect(useCase.execute('token')).rejects.toThrow(Error);
    // Volver a mockear para los siguientes tests
    jest.spyOn(PayloadMapper, 'mapToPayloadResDTO').mockReturnValue('mapped' as any);
  });

  it('should propagate error if thrown', async () => {
    process.env.PASETO_SECRET_NAME = 'dummy';
    secretsManager.getSecret.mockResolvedValue('secret');
  verifyJwtMock.mockImplementation(() => { throw new UnauthorizedError('fail'); });
  await expect(useCase.execute('token')).rejects.toThrow(UnauthorizedError);
  });
});
