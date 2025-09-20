import { NeedsMfaUseCase } from '../../../../src/application/usecases/mfa/needs-mfa.usecase';

describe('NeedsMfaUseCase', () => {
  it('debe retornar true si hay factor TOTP activo', async () => {
    const mfaRepo = { listByUser: jest.fn() };
    const useCase = new NeedsMfaUseCase(mfaRepo as any);
    mfaRepo.listByUser.mockResolvedValue([{ type: 'totp', status: 'active' }]);
    const result = await useCase.execute('user1');
    expect(result).toBe(true);
  });
  it('debe retornar false si no hay factor TOTP activo', async () => {
    const mfaRepo = { listByUser: jest.fn() };
    const useCase = new NeedsMfaUseCase(mfaRepo as any);
    mfaRepo.listByUser.mockResolvedValue([{ type: 'totp', status: 'pending' }]);
    const result = await useCase.execute('user1');
    expect(result).toBe(false);
  });
});
