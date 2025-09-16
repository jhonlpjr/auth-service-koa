import { RefreshTokenRepositoryImpl } from '../../../../src/infrastructure/database/repositories/refresh-token.postgres.repository';
import { PostgresDB } from '../../../../src/shared/utils/database';
import crypto from 'crypto';

jest.mock('../../../../src/shared/utils/database');
jest.mock('crypto');

describe('RefreshTokenRepositoryImpl', () => {
  let repo: RefreshTokenRepositoryImpl;
  const mockToken = 'sometoken';
  const mockHash = 'hashedtoken';
  const mockUserId = 'user123';
  const mockJti = 'jti123';
  const mockExpiresAt = new Date();
  const mockRow = { user_id: mockUserId, token_hash: mockHash, expires_at: mockExpiresAt, jti: mockJti };

  beforeEach(() => {
    repo = new RefreshTokenRepositoryImpl();
    jest.clearAllMocks();
    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue(mockHash),
    });
  });

  it('should save a refresh token', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({});
    await expect(repo.save(mockUserId, mockToken, mockExpiresAt, mockJti)).resolves.toBeUndefined();
    expect(PostgresDB.query).toHaveBeenCalledWith(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, jti) VALUES ($1, $2, $3, $4)',
      [mockUserId, mockHash, mockExpiresAt, mockJti]
    );
  });

  it('should find by jti', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({ rows: [mockRow] });
    const result = await repo.findByJti(mockJti);
    expect(result).toEqual(mockRow);
    expect(PostgresDB.query).toHaveBeenCalledWith('SELECT * FROM refresh_tokens WHERE jti = $1', [mockJti]);
  });

  it('should revoke a refresh token', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({});
    await expect(repo.revoke(mockJti)).resolves.toBeUndefined();
    expect(PostgresDB.query).toHaveBeenCalledWith('DELETE FROM refresh_tokens WHERE jti = $1', [mockJti]);
  });

  it('should verify a refresh token', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({ rows: [mockRow] });
    const result = await repo.verify(mockUserId, mockToken);
    expect(result).toEqual(mockRow);
    expect(PostgresDB.query).toHaveBeenCalledWith(
      'SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2',
      [mockUserId, mockHash]
    );
  });

  it('should throw DatabaseError on save error', async () => {
    (PostgresDB.query as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(repo.save(mockUserId, mockToken, mockExpiresAt, mockJti)).rejects.toThrow('Database error');
  });

  it('should throw DatabaseError on findByJti error', async () => {
    (PostgresDB.query as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(repo.findByJti(mockJti)).rejects.toThrow('Database error');
  });

  it('should throw DatabaseError on revoke error', async () => {
    (PostgresDB.query as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(repo.revoke(mockJti)).rejects.toThrow('Database error');
  });

  it('should throw DatabaseError on verify error', async () => {
    (PostgresDB.query as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(repo.verify(mockUserId, mockToken)).rejects.toThrow('Database error');
  });
});
