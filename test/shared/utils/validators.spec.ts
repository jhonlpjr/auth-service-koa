
import { validate } from 'class-validator';
import { validateDto } from '../../../src/shared/utils/validators';
import { BadRequestError } from '../../../src/shared/api/exceptions/bad-request-error';

jest.mock('class-validator');

describe('validateDto', () => {
  it('should resolve if no errors', async () => {
    (validate as jest.Mock).mockResolvedValue([]);
    await expect(validateDto({})).resolves.toBeUndefined();
  });

  it('should throw BadRequestError if errors exist', async () => {
    (validate as jest.Mock).mockResolvedValue([
      { constraints: { isEmail: 'email must be valid' } },
      { constraints: { minLength: 'too short' } }
    ]);
    await expect(validateDto({})).rejects.toThrow(BadRequestError);
    try {
      await validateDto({});
    } catch (e) {
      const err = e as BadRequestError;
      expect(err).toBeInstanceOf(BadRequestError);
      expect(err.details).toEqual([
        { isEmail: 'email must be valid' },
        { minLength: 'too short' }
      ]);
    }
  });
});
