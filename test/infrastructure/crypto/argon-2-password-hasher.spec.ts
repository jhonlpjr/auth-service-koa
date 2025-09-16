import { Argon2PasswordHasher } from '../../../src/infrastructure/crypto/argon-2-password-hasher';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('Argon2PasswordHasher', () => {
  const hasher = new Argon2PasswordHasher();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should hash a plain password', async () => {
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
    const result = await hasher.hash('plain');
    expect(argon2.hash).toHaveBeenCalledWith('plain', expect.any(Object));
    expect(result).toBe('hashed-password');
  });

  it('should verify a password', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    const result = await hasher.verify('hashed', 'plain');
    expect(argon2.verify).toHaveBeenCalledWith('hashed', 'plain');
    expect(result).toBe(true);
  });

  it('should return true for needsRehash if hash does not start with $argon2id$', () => {
    expect(hasher.needsRehash('other')).toBe(true);
  });

  it('should return false for needsRehash if hash starts with $argon2id$', () => {
    expect(hasher.needsRehash('$argon2id$something')).toBe(false);
  });
});
