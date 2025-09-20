import { ListFactorsUseCase } from '../../../../src/application/usecases/mfa/list-factors.usecase';

describe('ListFactorsUseCase', () => {
  it('debe listar los factores del usuario', async () => {
    const mfaRepo = { listByUser: jest.fn() };
    const useCase = new ListFactorsUseCase(mfaRepo as any);
    mfaRepo.listByUser.mockResolvedValue([{ id: 1, type: 'totp', status: 'active' }]);
    const result = await useCase.execute('user1');
    expect(result).toEqual([{ id: 1, type: 'totp', status: 'active' }]);
    expect(mfaRepo.listByUser).toHaveBeenCalledWith('user1');
  });
});
