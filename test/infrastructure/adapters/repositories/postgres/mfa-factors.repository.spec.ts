

jest.mock("../../../../../src/shared/utils/database", () => ({
  PostgresDB: { query: jest.fn() }
}));
import { PgMfaFactorsRepository } from "../../../../../src/infrastructure/adapters/repositories/postgres/mfa-factors.repository";
import { MfaTypes } from "../../../../../src/shared/enums/mfa-types.enum";
import { PostgresDB } from "../../../../../src/shared/utils/database";


describe('PgMfaFactorsRepository', () => {
  const repo = new PgMfaFactorsRepository();
  const userId = 'user-1';
  const type = MfaTypes.TOTP;
  const secret = 'ciphertext';
  const now = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getPending should query and return UserMfaFactor or null', async () => {
    (PostgresDB.query as jest.MockedFunction<typeof PostgresDB.query>).mockResolvedValueOnce({
      rows: [{ id: 'f1' }],
      command: '',
      rowCount: 1,
      oid: 0,
      fields: []
    });
    const res = await repo.getPending(userId, type);
    expect(PostgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining('status=\'pending\''),
      [userId, type]
    );
    expect(res).toEqual({ id: 'f1' });

    (PostgresDB.query as jest.MockedFunction<typeof PostgresDB.query>).mockResolvedValueOnce({
      rows: [],
      command: '',
      rowCount: 0,
      oid: 0,
      fields: []
    });
    const res2 = await repo.getPending(userId, type);
    expect(res2).toBeNull();
  });

  it('createPending should insert and return UserMfaFactor', async () => {
    (PostgresDB.query as jest.MockedFunction<typeof PostgresDB.query>).mockResolvedValueOnce({
      rows: [{ id: 'f2' }],
      command: '',
      rowCount: 1,
      oid: 0,
      fields: []
    });
    const res = await repo.createPending(userId, type, secret);
    expect(PostgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_mfa_factors'),
      expect.arrayContaining([userId, type, secret])
    );
    expect(res).toEqual({ id: 'f2' });
  });

  it('activateFactor should update status to ACTIVE_STRING', async () => {
    (PostgresDB.query as jest.MockedFunction<typeof PostgresDB.query>).mockResolvedValueOnce({
      rows: [],
      command: '',
      rowCount: 0,
      oid: 0,
      fields: []
    });
    await repo.activateFactor(userId, type);
    expect(PostgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining('SET status=ACTIVE_STRING'),
      expect.arrayContaining([userId, type])
    );
  });

  it('getActive should query and return UserMfaFactor or null', async () => {
    (PostgresDB.query as jest.MockedFunction<typeof PostgresDB.query>).mockResolvedValueOnce({
      rows: [{ id: 'f3' }],
      command: '',
      rowCount: 1,
      oid: 0,
      fields: []
    });
    const res = await repo.getActive(userId, type);
    expect(PostgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining('status=ACTIVE_STRING'),
      [userId, type]
    );
    expect(res).toEqual({ id: 'f3' });

    (PostgresDB.query as jest.MockedFunction<typeof PostgresDB.query>).mockResolvedValueOnce({
      rows: [],
      command: '',
      rowCount: 0,
      oid: 0,
      fields: []
    });
    const res2 = await repo.getActive(userId, type);
    expect(res2).toBeNull();
  });

  it('listByUser should return all non-revoked factors', async () => {
    (PostgresDB.query as jest.MockedFunction<typeof PostgresDB.query>).mockResolvedValueOnce({
      rows: [{ id: 'a' }, { id: 'b' }],
      command: '',
      rowCount: 2,
      oid: 0,
      fields: []
    });
    const res = await repo.listByUser(userId);
    expect(PostgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining('status!=\'revoked\''),
      [userId]
    );
    expect(res).toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('revokeFactor should update status to revoked', async () => {
    (PostgresDB.query as jest.MockedFunction<typeof PostgresDB.query>).mockResolvedValueOnce({
      rows: [],
      command: '',
      rowCount: 0,
      oid: 0,
      fields: []
    });
    await repo.revokeFactor('factor-1');
    expect(PostgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining('status=\'revoked\''),
      expect.arrayContaining(['factor-1'])
    );
  });
});
