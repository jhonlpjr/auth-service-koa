import { PayloadMapper } from '../../../src/application/mappers/payload.mapper';
import { PayloadDTO } from '../../../src/application/dto/payload.dto';
import { UnauthorizedError } from '../../../src/shared/exceptions/unauthorized-error';

describe('PayloadMapper.mapToPayloadResDTO', () => {
  it('should map valid payload to PayloadDTO', () => {
    const payload = { id: '1', username: 'user', key: 'key123' };
    const result = PayloadMapper.mapToPayloadResDTO(payload);
    expect(result).toBeInstanceOf(PayloadDTO);
    expect(result).toEqual(new PayloadDTO('1', 'user', 'key123'));
  });

  it('should throw UnauthorizedError if payload is not an object', () => {
    expect(() => PayloadMapper.mapToPayloadResDTO(null as any)).toThrow(UnauthorizedError);
    expect(() => PayloadMapper.mapToPayloadResDTO('string' as any)).toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError if id is missing or not a string', () => {
    expect(() => PayloadMapper.mapToPayloadResDTO({ username: 'user', key: 'key123' })).toThrow(UnauthorizedError);
    expect(() => PayloadMapper.mapToPayloadResDTO({ id: 123, username: 'user', key: 'key123' })).toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError if username is missing or not a string', () => {
    expect(() => PayloadMapper.mapToPayloadResDTO({ id: '1', key: 'key123' })).toThrow(UnauthorizedError);
    expect(() => PayloadMapper.mapToPayloadResDTO({ id: '1', username: 123, key: 'key123' })).toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError if key is missing or not a string', () => {
    expect(() => PayloadMapper.mapToPayloadResDTO({ id: '1', username: 'user' })).toThrow(UnauthorizedError);
    expect(() => PayloadMapper.mapToPayloadResDTO({ id: '1', username: 'user', key: 123 })).toThrow(UnauthorizedError);
  });
});
