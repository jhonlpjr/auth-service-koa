
// Mock manual de 'jose' para evitar problemas ESM
jest.mock('jose', () => ({
  importSPKI: jest.fn(),
  exportJWK: jest.fn(),
}));

import { getJwks } from '../../../src/infrastructure/crypto/jwks.provider';
import SecretsManagerService from '../../../src/infrastructure/secrets/secret-manager.service';
import { importSPKI, exportJWK } from 'jose';
import { EC_PUBLIC_KEY } from '../../../src/shared/constants/keys.constants';

describe('getJwks', () => {
  let secretsManagerMock: any;

  beforeEach(() => {
    secretsManagerMock = {
      getSecret: jest.fn(),
    };
    jest.spyOn(SecretsManagerService, 'getInstance').mockReturnValue(secretsManagerMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return empty keys array if no public key', async () => {
    secretsManagerMock.getSecret.mockResolvedValue(undefined);
    const result = await getJwks();
    expect(result).toEqual({ keys: [] });
    expect(secretsManagerMock.getSecret).toHaveBeenCalledWith(EC_PUBLIC_KEY);
  });

  it('should return JWKS with correct fields if public key exists', async () => {
    const pem = '-----BEGIN PUBLIC KEY-----\n...key...\n-----END PUBLIC KEY-----';
    secretsManagerMock.getSecret.mockResolvedValue(pem);
    const fakeKey = { fake: 'key' };
    const fakeJwk = { kty: 'EC', crv: 'P-256', x: 'x', y: 'y' };
    (importSPKI as jest.Mock).mockResolvedValue(fakeKey);
    (exportJWK as jest.Mock).mockResolvedValue({ ...fakeJwk });

    const result = await getJwks();
    expect(result.keys).toHaveLength(1);
    expect(result.keys[0]).toMatchObject({
      kty: 'EC', crv: 'P-256', x: 'x', y: 'y', alg: 'ES256', use: 'sig', kid: 'main',
    });
  });
});
