import { CreateUserUseCase } from '../../../src/application/usecases/create-user.usecase';
import { UserRepository } from '../../../src/domain/repository/user.repository';
import { Argon2PasswordHasher } from '../../../src/infrastructure/crypto/argon-2-password-hasher';
import * as crypto from 'crypto';
jest.mock('crypto');

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: Argon2PasswordHasher;

  beforeEach(() => {
    userRepository = {
      createUser: jest.fn()
    } as any;
    useCase = new CreateUserUseCase(userRepository);
  jest.spyOn(Argon2PasswordHasher.prototype, 'hash').mockResolvedValue('hashedPassword');
  // Mock explícito de randomBytes para evitar redefinición de propiedad
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
    expect(Argon2PasswordHasher.prototype.hash).toHaveBeenCalledWith('pass');
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
