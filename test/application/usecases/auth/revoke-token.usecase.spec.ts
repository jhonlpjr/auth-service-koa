import { RevokeTokenUseCase } from '../../../../src/application/usecases/auth/revoke-token.usecase';

describe('RevokeTokenUseCase', () => {
  it('debe revocar por jti si se provee', async () => {
    const repo = { revoke: jest.fn(), revokeByUserId: jest.fn() };
    const useCase = new RevokeTokenUseCase(repo as any);
    await useCase.execute({ userId: 'user1', jti: 'jti1' });
    expect(repo.revoke).toHaveBeenCalledWith('jti1');
    expect(repo.revokeByUserId).not.toHaveBeenCalled();
  });
  it('debe revocar por userId si no hay jti', async () => {
    const repo = { revoke: jest.fn(), revokeByUserId: jest.fn() };
    const useCase = new RevokeTokenUseCase(repo as any);
    await useCase.execute({ userId: 'user1' });
    expect(repo.revokeByUserId).toHaveBeenCalledWith('user1');
    expect(repo.revoke).not.toHaveBeenCalled();
  });
});
