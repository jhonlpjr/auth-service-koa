

import { CreateUserUseCase } from '../../../../src/application/usecases/auth/create-user.usecase';
import { Argon2PasswordHasher } from '../../../../src/infrastructure/crypto/argon-2-password-hasher';
import * as crypto from 'crypto';
jest.mock('crypto');

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: any;

  beforeEach(() => {
    userRepository = { createUser: jest.fn() };
  const passwordHasher = new Argon2PasswordHasher();
  useCase = new CreateUserUseCase(userRepository as any, passwordHasher as any);
  jest.spyOn(passwordHasher, 'hash').mockResolvedValue('hashedPassword');
    (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.alloc(32, 1));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should hash password, generate key, and create user', async () => {
    const dto = { username: 'user', email: 'mail@mail.com', password: 'pass' };
  const mockKey = Buffer.alloc(32, 1).toString('hex');
  const mockUser = { username: 'user', email: 'mail@mail.com', password: 'hashedPassword', key: mockKey };
    userRepository.createUser.mockResolvedValue(mockUser);
    const result = await useCase.execute(dto as any);
  // El mock está en la instancia, no en el prototype
  expect(useCase['passwordHasher'].hash).toHaveBeenCalledWith('pass');
    expect(crypto.randomBytes).toHaveBeenCalledWith(32);
    expect(userRepository.createUser).toHaveBeenCalledWith({
      username: 'user',
      email: 'mail@mail.com',
      password: 'hashedPassword',
      key: mockKey
    });
    expect(result).toEqual({ user: mockUser, key: mockUser.key });
  });
});
