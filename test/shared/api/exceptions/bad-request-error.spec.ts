import { BadRequestError } from '../../../../src/shared/exceptions/bad-request-error';
import { HttpStatus } from '../../../../src/shared/enums/http-status.enum';

describe('BadRequestError', () => {
  it('should set name, statusCode, and message', () => {
    const err = new BadRequestError('Invalid input');
    expect(err.name).toBe('BadRequestError');
    expect(err.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(err.message).toBe('Invalid input');
    expect(err.details).toBeUndefined();
  });

  it('should set details if provided', () => {
    const err = new BadRequestError('Invalid input', { field: 'email' });
    expect(err.details).toEqual({ field: 'email' });
  });
});
