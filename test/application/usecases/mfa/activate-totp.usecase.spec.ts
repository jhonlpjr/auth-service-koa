import { ActivateTotpUseCase } from '../../../../src/application/usecases/mfa/activate-totp.usecase';

describe('ActivateTotpUseCase', () => {
  it('debe activar el factor si el token es válido', async () => {
    const mfaRepo = { getPending: jest.fn(), activateFactor: jest.fn() };
    const useCase = new ActivateTotpUseCase(mfaRepo as any);
    mfaRepo.getPending.mockResolvedValue({ secret: 'secret' });
    jest.spyOn(require('otplib').authenticator, 'check').mockReturnValue(true);
    await useCase.execute('user1', '123456');
    expect(mfaRepo.activateFactor).toHaveBeenCalledWith('user1', 'totp');
  });
  it('debe lanzar error si no hay factor pendiente', async () => {
    const mfaRepo = { getPending: jest.fn() };
    const useCase = new ActivateTotpUseCase(mfaRepo as any);
    mfaRepo.getPending.mockResolvedValue(null);
    await expect(useCase.execute('user1', '123456')).rejects.toThrow('No pending TOTP setup');
  });
});
