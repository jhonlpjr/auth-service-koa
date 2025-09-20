
import { PgRefreshTokenRepository } from '../../../../src/infrastructure/adapters/repositories/postgres/refresh-token.postgres.repository';
import { PostgresDB } from '../../../../src/shared/utils/database';
import crypto from 'crypto';

jest.mock('../../../../src/shared/utils/database');
jest.mock('crypto');

describe('PgRefreshTokenRepository', () => {
  let repo: PgRefreshTokenRepository;
  const mockToken = 'sometoken';
  const mockHash = 'hashedtoken';
  const mockUserId = 'user123';
  const mockJti = 'jti123';
  const mockExpiresAt = new Date();
  const mockRow = { user_id: mockUserId, token_hash: mockHash, expires_at: mockExpiresAt, jti: mockJti };

  beforeEach(() => {
  repo = new PgRefreshTokenRepository();
    jest.clearAllMocks();
    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue(mockHash),
    });
  });

  it('should save a refresh token (extended)', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({});
    const meta = { ip: '127.0.0.1' };
    const parentJti = 'parent-jti';
    await expect(repo.save(mockUserId, mockToken, mockExpiresAt, mockJti, meta, parentJti)).resolves.toBeUndefined();
    expect(PostgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO refresh_tokens'),
      [mockUserId, mockHash, mockExpiresAt, mockJti, JSON.stringify(meta), parentJti]
    );
  });

  it('should mark a refresh token as used', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({});
    await expect(repo.markAsUsed(mockJti)).resolves.toBeUndefined();
    expect(PostgresDB.query).toHaveBeenCalledWith('UPDATE refresh_tokens SET used = TRUE WHERE jti = $1', [mockJti]);
  });

  it('should mark a refresh token as rotated', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({});
    await expect(repo.markAsRotated(mockJti)).resolves.toBeUndefined();
    expect(PostgresDB.query).toHaveBeenCalledWith('UPDATE refresh_tokens SET rotated = TRUE, rotated_at = NOW() WHERE jti = $1', [mockJti]);
  });

  it('should find by parentJti', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({ rows: [mockRow] });
    const result = await repo.findByParentJti('parent-jti');
    expect(result).toEqual([mockRow]);
    expect(PostgresDB.query).toHaveBeenCalledWith('SELECT * FROM refresh_tokens WHERE parent_jti = $1', ['parent-jti']);
  });

  it('should revoke by userId', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({});
    await expect(repo.revokeByUserId(mockUserId)).resolves.toBeUndefined();
    expect(PostgresDB.query).toHaveBeenCalledWith('DELETE FROM refresh_tokens WHERE user_id = $1', [mockUserId]);
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
