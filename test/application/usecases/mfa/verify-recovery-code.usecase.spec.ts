import { VerifyRecoveryCodeUseCase } from '../../../../src/application/usecases/mfa/verify-recovery-code.usecase';

describe('VerifyRecoveryCodeUseCase', () => {
  it('debe marcar como usado si el código es válido', async () => {
    const recoveryRepo = { verifyCode: jest.fn(), markUsed: jest.fn() };
    const useCase = new VerifyRecoveryCodeUseCase(recoveryRepo as any);
    recoveryRepo.verifyCode.mockResolvedValue({ ok: true, codeId: 'code1' });
    await useCase.execute('user1', 'code');
    expect(recoveryRepo.markUsed).toHaveBeenCalledWith('code1');
  });
  it('debe lanzar error si el código es inválido', async () => {
    const recoveryRepo = { verifyCode: jest.fn() };
    const useCase = new VerifyRecoveryCodeUseCase(recoveryRepo as any);
    recoveryRepo.verifyCode.mockResolvedValue({ ok: false });
    await expect(useCase.execute('user1', 'bad')).rejects.toThrow('Invalid recovery code');
  });
});
