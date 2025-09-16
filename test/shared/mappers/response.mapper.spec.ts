import { ResponseMapper } from '../../../src/shared/mappers/response.mapper';
import { HttpStatus } from '../../../src/shared/enums/http-status.enum';

describe('ResponseMapper', () => {
  it('should return okResponse with code 200', () => {
    const data = { foo: 'bar' };
    const res = ResponseMapper.okResponse(data);
    expect(res.success).toBe(true);
    expect(res.data).toEqual(data);
    expect(res.code).toBe(HttpStatus.OK);
  });

  it('should return createdResponse with code 201', () => {
    const data = { foo: 'bar' };
    const res = ResponseMapper.createdResponse(data);
    expect(res.success).toBe(true);
    expect(res.data).toEqual(data);
    expect(res.code).toBe(HttpStatus.CREATED);
  });

  it('should return errorResponse for HTTP error', () => {
    const error = { message: 'Bad', statusCode: 400, details: { field: 'x' } };
    const res = ResponseMapper.errorResponse(error);
    expect(res.success).toBe(false);
    expect(res.message).toBe('Bad');
    expect(res.code).toBe(400);
    expect(res.errors).toEqual({ field: 'x' });
  });

  it('should return errorResponse for generic error', () => {
    const error = new Error('Oops');
    const res = ResponseMapper.errorResponse(error);
    expect(res.success).toBe(false);
    expect(res.message).toBe('Oops');
    expect(res.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
