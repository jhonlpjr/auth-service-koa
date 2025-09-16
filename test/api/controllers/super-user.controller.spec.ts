import { SuperUserController } from '../../../src/api/controllers/super-user.controller';
import { ResponseMapper } from '../../../src/shared/mappers/response.mapper';
import { UserMapper } from '../../../src/api/mappers/user.mapper';
import { validateDto } from '../../../src/shared/utils/validators';

describe('SuperUserController', () => {
  let controller: SuperUserController;
  let createUserUseCase: any;
  let ctx: any;

  beforeEach(() => {
    createUserUseCase = { execute: jest.fn() };
    controller = new SuperUserController(createUserUseCase);
    ctx = { request: { body: { username: 'user', email: 'mail@mail.com', password: 'pass' } }, body: undefined };
    jest.spyOn(ResponseMapper, 'createdResponse').mockReturnValue({ created: true } as any);
    jest.spyOn(UserMapper, 'toUserResponse').mockReturnValue({ id: '1', username: 'user' } as any);
    jest.spyOn(validateDto as any, 'apply').mockResolvedValue(undefined);
    (validateDto as jest.Mock) = jest.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should validate, call usecase, and map response', async () => {
    const mockResult = { user: { id: '1', username: 'user' }, key: 'key123' };
    createUserUseCase.execute.mockResolvedValue(mockResult);
    await controller.createUser(ctx);
    expect(validateDto).toHaveBeenCalled();
    expect(createUserUseCase.execute).toHaveBeenCalled();
    expect(UserMapper.toUserResponse).toHaveBeenCalledWith(mockResult.user);
    expect(ResponseMapper.createdResponse).toHaveBeenCalledWith({
      user: { id: '1', username: 'user' },
      key: 'key123',
    });
    expect(ctx.body).toEqual({ created: true });
  });
});
