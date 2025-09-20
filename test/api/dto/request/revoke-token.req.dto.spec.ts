import { validate } from 'class-validator';
import { RevokeTokenReqDTO } from '../../../../src/api/dto/request/revoke-token.req.dto';

describe('RevokeTokenReqDTO', () => {
  it('should be valid with only userId', async () => {
    const dto = new RevokeTokenReqDTO('user-1');
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be valid with only jti', async () => {
    const dto = new RevokeTokenReqDTO(undefined, 'jti-123');
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be valid if neither userId nor jti is provided (both optional)', async () => {
    const dto = new RevokeTokenReqDTO();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be invalid if userId is not a string', async () => {
    // @ts-expect-error
    const dto = new RevokeTokenReqDTO(123, undefined);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should be invalid if jti is not a string', async () => {
    // @ts-expect-error
    const dto = new RevokeTokenReqDTO(undefined, 456);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should be valid with both userId and jti as strings', async () => {
    const dto = new RevokeTokenReqDTO('user-1', 'jti-123');
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
