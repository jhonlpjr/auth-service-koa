import { AuthMapper } from "../../../src/api/mappers/auth.mapper";
import { LoginResDTO } from "../../../src/api/dto/response/login.res.dto";


describe('AuthMapper', () => {
  describe('toLoginResponse', () => {
    it('should map to LoginResDTO', () => {
      const dto = AuthMapper.toLoginResponse('access', 'refresh', 3600, 'Bearer', 'user-1', 'scope1', 'aud1');
      expect(dto).toBeInstanceOf(LoginResDTO);
      expect(dto).toMatchObject({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
        tokenType: 'Bearer',
        userId: 'user-1',
        scope: 'scope1',
        aud: 'aud1',
      });
    });
  });

  describe('toMfaLoginResponse', () => {
    it('should map to MFA login response', () => {
      const result = AuthMapper.toMfaLoginResponse('tx-123', ['totp', 'recovery']);
      expect(result).toEqual({
        step: 'mfa',
        login_tx: 'tx-123',
        mfa: { types: ['totp', 'recovery'] },
      });
    });
  });

  describe('toRevokeResponse', () => {
    it('should map to revoked true', () => {
      expect(AuthMapper.toRevokeResponse(true)).toEqual({ revoked: true });
    });
    it('should map to revoked false', () => {
      expect(AuthMapper.toRevokeResponse(false)).toEqual({ revoked: false });
    });
  });

  describe('toPayloadResponse', () => {
    it('should map payload fields', () => {
      const payload = { id: 'u1', username: 'user', key: 'k' };
      expect(AuthMapper.toPayloadResponse(payload)).toEqual(payload);
    });
    it('should handle missing fields', () => {
      const payload = { id: 'u2' };
      expect(AuthMapper.toPayloadResponse(payload)).toMatchObject({ id: 'u2', username: undefined, key: undefined });
    });
  });
});
