import { IssueTokensForUserIdUseCase } from '../../../../src/application/usecases/auth/issue-tokens-for-user-id.usecase';

describe('IssueTokensForUserIdUseCase', () => {
  beforeEach(() => {
    process.env.JWT_DEFAULT_AUD = 'test-aud';
    process.env.JWT_DEFAULT_SCOPE = 'test-scope';
  });
  it('debe emitir tokens para un userId', async () => {
  const repo = { getUserById: jest.fn() };
  const refreshTokenRepo = { save: jest.fn() };
  const useCase = new IssueTokensForUserIdUseCase(repo as any, refreshTokenRepo as any);
  repo.getUserById.mockResolvedValue({ id: 'user1', username: 'test', key: 'key' });
  refreshTokenRepo.save.mockResolvedValue(undefined);
  const result = await useCase.execute('user1');
  expect(repo.getUserById).toHaveBeenCalledWith('user1');
  expect(refreshTokenRepo.save).toHaveBeenCalled();
  expect(result.accessToken).toBeDefined();
  expect(result.userId).toBe('user1');
  });
  it('debe lanzar error si el usuario no existe', async () => {
  const repo = { getUserById: jest.fn() };
  const refreshTokenRepo = { save: jest.fn() };
  const useCase = new IssueTokensForUserIdUseCase(repo as any, refreshTokenRepo as any);
  repo.getUserById.mockResolvedValue(null);
  await expect(useCase.execute('user1')).rejects.toThrow();
  });
});
