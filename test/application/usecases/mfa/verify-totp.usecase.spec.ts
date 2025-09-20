import { VerifyTotpUseCase } from '../../../../src/application/usecases/mfa/verify-totp.usecase';

describe('VerifyTotpUseCase', () => {
  it('debe verificar el token TOTP si hay factor activo', async () => {
    const mfaRepo = { getActive: jest.fn() };
    const useCase = new VerifyTotpUseCase(mfaRepo as any);
    mfaRepo.getActive.mockResolvedValue({ secret: 'secret' });
    jest.spyOn(require('otplib').authenticator, 'check').mockReturnValue(true);
    await expect(useCase.execute('user1', '123456')).resolves.toBeUndefined();
  });
  it('debe lanzar error si no hay factor activo', async () => {
    const mfaRepo = { getActive: jest.fn() };
    const useCase = new VerifyTotpUseCase(mfaRepo as any);
    mfaRepo.getActive.mockResolvedValue(null);
    await expect(useCase.execute('user1', '123456')).rejects.toThrow('No active TOTP');
  });
});
