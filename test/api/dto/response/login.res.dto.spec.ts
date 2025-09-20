import { LoginResDTO } from '../../../../src/api/dto/response/login.res.dto';

describe('LoginResDTO', () => {
  it('should create an instance with all required fields', () => {
    const dto = new LoginResDTO(
      'token123', // accessToken
      'refresh456', // refreshToken
      3600, // expiresIn
      'Bearer', // tokenType
      'user-1', // userId
      'read:all', // scope (opcional)
      'audience-1' // aud (opcional)
    );
    expect(dto.accessToken).toBe('token123');
    expect(dto.refreshToken).toBe('refresh456');
    expect(dto.expiresIn).toBe(3600);
    expect(dto.tokenType).toBe('Bearer');
    expect(dto.userId).toBe('user-1');
    expect(dto.scope).toBe('read:all');
    expect(dto.aud).toBe('audience-1');
  });
});
