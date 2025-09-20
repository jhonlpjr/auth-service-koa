import { PgUserRepository } from '../../../../src/infrastructure/adapters/repositories/postgres/user.postgres.repository';
import { PostgresDB } from '../../../../src/shared/utils/database';

jest.mock('../../../../src/shared/utils/database');

const mockUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashed',
  key: 'key123',
};


describe('PgUserRepository', () => {
  let repo: PgUserRepository;

  beforeEach(() => {
    repo = new PgUserRepository();
    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });
    const user = await repo.createUser(mockUser);
    expect(user).toEqual(mockUser);
    expect(PostgresDB.query).toHaveBeenCalled();
  });

  it('should get user by id', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });
    const user = await repo.getUserById('id123');
    expect(user).toEqual(mockUser);
    expect(PostgresDB.query).toHaveBeenCalled();
  });

  it('should get user by username', async () => {
    (PostgresDB.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });
    const user = await repo.getUserByUsername('testuser');
    expect(user).toEqual(mockUser);
    expect(PostgresDB.query).toHaveBeenCalled();
  });

  it('should throw DatabaseError on createUser error', async () => {
    (PostgresDB.query as jest.Mock).mockRejectedValue(new Error('fail'));
    await expect(repo.createUser(mockUser)).rejects.toThrow('Database error');
  });
});
