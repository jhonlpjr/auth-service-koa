import { UserLoggedResDTO } from '../../../../src/api/dto/response/user-logged.res.dto';
import { User } from '../../../../src/domain/interfaces/user.interface';

describe('UserLoggedResDTO', () => {
  it('should create an instance with token and user', () => {
    const user: User = { id: '1', username: 'test', password: 'hashed', key: 'key123' };
    const dto = new UserLoggedResDTO('token123', user);
    expect(dto.token).toBe('token123');
    expect(dto.user).toBe(user);
  });
});
