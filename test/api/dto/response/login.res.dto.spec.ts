import { LoginResDTO } from '../../../../src/api/dto/response/login.res.dto';

describe('LoginResDTO', () => {
  it('should create an instance with token and refreshToken', () => {
    const dto = new LoginResDTO('token123', 'refresh456');
    expect(dto.accessToken).toBe('token123');
    expect(dto.refreshToken).toBe('refresh456');
  });
});
