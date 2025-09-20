import { SetupTotpUseCase } from '../../../../src/application/usecases/mfa/setup-totp.usecase';
import { TYPES } from '../../../../src/infrastructure/providers/types';

describe('SetupTotpUseCase', () => {
    it('debe crear un factor pendiente y devolver la url otpauth', async () => {
        const mfaRepo = { createPending: jest.fn() };
        const useCase = new SetupTotpUseCase(mfaRepo as any);
        const url = await useCase.execute('user1', 'testuser', 'MyService');
        expect(typeof url).toBe('string');
        expect(mfaRepo.createPending).toHaveBeenCalledWith('user1', 'totp', expect.any(String));
    });
});
