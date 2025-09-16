import { AuthController } from '../../../src/api/controllers/auth.controller';
import { AuthService } from '../../../src/application/service/auth.service';
import { container } from '../../../src/infrastructure/providers/container-config';
import { TYPES } from '../../../src/infrastructure/providers/types';
import { ResponseMapper } from '../../../src/shared/mappers/response.mapper';
import { AuthMapper } from '../../../src/api/mappers/auth.mapper';
import { validateDto } from '../../../src/shared/utils/validators';

jest.mock('../../../src/infrastructure/providers/container-config');
jest.mock('../../../src/shared/utils/validators');
jest.mock('../../../src/shared/mappers/response.mapper');
jest.mock('../../../src/api/mappers/auth.mapper');

describe('AuthController', () => {
  let controller: AuthController;
  let ctx: any;
  let authService: any;

  beforeEach(() => {
    controller = new AuthController();
    ctx = { request: { body: {} }, body: undefined };
    authService = {
      login: jest.fn(),
      refreshToken: jest.fn(),
      getPayload: jest.fn(),
    };
    (container.get as jest.Mock).mockImplementation((type) => {
      if (type === TYPES.AuthService) return authService;
      return undefined;
    });
    (validateDto as jest.Mock).mockResolvedValue(undefined);
  });

  it('login: should validate, call service, and map response', async () => {
    ctx.request.body = { username: 'user', password: 'pass' };
    authService.login.mockResolvedValue({ token: 't', refreshToken: 'r' });
    (AuthMapper.toLoginResponse as jest.Mock).mockReturnValue({ token: 't', refreshToken: 'r' });
    (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
    await controller.login(ctx);
    expect(validateDto).toHaveBeenCalled();
    expect(authService.login).toHaveBeenCalledWith('user', 'pass');
    expect(AuthMapper.toLoginResponse).toHaveBeenCalledWith('t', 'r');
    expect(ResponseMapper.okResponse).toHaveBeenCalledWith({ token: 't', refreshToken: 'r' });
    expect(ctx.body).toEqual({ ok: true });
  });

  it('refreshToken: should validate, call service, and map response', async () => {
    ctx.request.body = { userId: '1', refreshToken: 'r' };
    authService.refreshToken.mockResolvedValue({ token: 't', refreshToken: 'r' });
    (AuthMapper.toLoginResponse as jest.Mock).mockReturnValue({ token: 't', refreshToken: 'r' });
    (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
    await controller.refreshToken(ctx);
    expect(validateDto).toHaveBeenCalled();
    expect(authService.refreshToken).toHaveBeenCalledWith('1', 'r');
    expect(AuthMapper.toLoginResponse).toHaveBeenCalledWith('t', 'r');
    expect(ResponseMapper.okResponse).toHaveBeenCalledWith({ token: 't', refreshToken: 'r' });
    expect(ctx.body).toEqual({ ok: true });
  });

  it('getPayload: should validate, call service, and map response', async () => {
    ctx.request.body = { token: 't' };
    authService.getPayload.mockResolvedValue({ id: '1', username: 'u', key: 'k' });
    (AuthMapper.toPayloadResponse as jest.Mock).mockReturnValue({ id: '1', username: 'u', key: 'k' });
    (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
    await controller.getPayload(ctx);
    expect(validateDto).toHaveBeenCalled();
    expect(authService.getPayload).toHaveBeenCalledWith('t');
    expect(AuthMapper.toPayloadResponse).toHaveBeenCalledWith({ id: '1', username: 'u', key: 'k' });
    expect(ResponseMapper.okResponse).toHaveBeenCalledWith({ id: '1', username: 'u', key: 'k' });
    expect(ctx.body).toEqual({ ok: true });
  });
});
