


import argon2 from 'argon2';
jest.mock('argon2');
import { PgRecoveryCodesRepository } from '../../../../../src/infrastructure/adapters/repositories/postgres/recovery-codes.repository';
import { PostgresDB } from '../../../../../src/shared/utils/database';

jest.mock('../../../../../src/shared/utils/database', () => ({
  PostgresDB: { query: jest.fn() }
}));



// Ensure a clean module registry for crypto and argon2 mocks
jest.resetModules();
const crypto = require('crypto');
jest.spyOn(crypto, 'randomBytes').mockImplementation(() => Buffer.from('abcd1234abcd1234', 'hex'));
jest.spyOn(crypto, 'randomUUID').mockReturnValue('11111111-1111-1111-1111-111111111111');


const RealDate = Date;

describe('PgRecoveryCodesRepository', () => {
  const repo = new PgRecoveryCodesRepository();
  const userId = 'user-1';
  const code = 'code1234';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation((...args: any[]) => {
      if (args.length === 0) {
        return new RealDate('2020-01-01T00:00:00Z');
      }
      // Use apply to avoid TypeScript spread error
      return new (RealDate as any)(...args);
    });
  });

  it('generateCodes should insert codes and return masked', async () => {
  (argon2.hash as jest.MockedFunction<typeof argon2.hash>).mockResolvedValue('hash1');
    (PostgresDB.query as jest.Mock).mockResolvedValue({});
    const masked = await repo.generateCodes(userId, 1);
    expect(PostgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_recovery_codes'),
      [
        '11111111-1111-1111-1111-111111111111', // id (from mock)
        userId,
        'hash1',
        new Date('2020-01-01T00:00:00.000Z') // date (from mock)
      ]
    );
    expect(masked[0]).toMatch(/\*\*\*\*/);
  });

  it('verifyCode should return ok and codeId if match', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({ rows: [
      { id: 'id1', code_hash: 'hash1' },
      { id: 'id2', code_hash: 'hash2' }
    ] });
  (argon2.verify as jest.MockedFunction<typeof argon2.verify>).mockImplementation(async (hash: string, password: string | Buffer) => {
    if (typeof password === 'string') {
      return hash === 'hash2' && password === code;
    }
    return false;
  });
    const res = await repo.verifyCode(userId, code);
    expect(PostgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, code_hash'),
      [userId]
    );
    expect(res).toEqual({ ok: true, codeId: 'id2' });
  });

  it('verifyCode should return ok: false if no match', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({ rows: [
      { id: 'id1', code_hash: 'hash1' }
    ] });
  (argon2.verify as jest.MockedFunction<typeof argon2.verify>).mockResolvedValue(false);
    const res = await repo.verifyCode(userId, code);
    expect(res).toEqual({ ok: false });
  });

  it('markUsed should update used=1', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({});
    await repo.markUsed('id1');
    expect(PostgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining('SET used=1'),
      ['id1']
    );
  });
});
