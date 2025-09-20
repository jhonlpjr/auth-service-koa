import { UserMapper } from '../../../src/api/mappers/user.mapper';
import { UserLoggedResDTO } from '../../../src/api/dto/response/user-logged.res.dto';
import { User } from '../../../src/domain/interfaces/user.interface';

describe('UserMapper', () => {
  describe('toUserLoggedResDTO', () => {
    it('should map token and user to UserLoggedResDTO', () => {
      const user: User = {
        id: 'u1',
        username: 'test',
        key: 'k',
        created_at: new Date(),
      };
      const token = 'token123';
      const dto = UserMapper.toUserLoggedResDTO(token, user);
      expect(dto).toBeInstanceOf(UserLoggedResDTO);
      expect(dto.token).toBe(token);
      expect(dto.user).toBe(user);
    });
  });

  describe('toUserResponse', () => {
    it('should map user fields to response object', () => {
      const user: User = {
        id: 'u2',
        username: 'user2',
        key: 'k2',
        created_at: new Date('2023-01-01T00:00:00Z'),
      };
      const result = UserMapper.toUserResponse(user);
      expect(result).toMatchObject({
        id: 'u2',
        username: 'user2',
        key: 'k2',
        created_at: new Date('2023-01-01T00:00:00Z'),
      });
    });
    it('should include email if present', () => {
      const user: User & { email: string } = {
        id: 'u3',
        username: 'user3',
        key: 'k3',
        created_at: new Date(),
        email: 'test@example.com',
      };
      const result = UserMapper.toUserResponse(user);
      expect(result.email).toBe('test@example.com');
    });
    it('should set email as undefined if not present', () => {
      const user: User = {
        id: 'u4',
        username: 'user4',
        key: 'k4',
        created_at: new Date(),
      };
      const result = UserMapper.toUserResponse(user);
      expect(result.email).toBeUndefined();
    });
  });
});
