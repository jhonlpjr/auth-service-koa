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
    ctx = {
      request: { body: {} },
      body: undefined,
      state: { cookies: {} }, // Mock cookies as empty object
      headers: {},
      cookies: { set: jest.fn() }, // Mock cookies.set for setCookie util
    };
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
    authService.login.mockResolvedValue({ accessToken: 't', refreshToken: 'r' });
    (AuthMapper.toLoginResponse as jest.Mock).mockReturnValue({ accessToken: 't', refreshToken: 'r' });
    (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
    await controller.login(ctx);
    expect(validateDto).toHaveBeenCalled();
    expect(authService.login).toHaveBeenCalledWith('user', 'pass');
    expect(AuthMapper.toLoginResponse).toHaveBeenCalledWith('t', 'r');
    expect(ResponseMapper.okResponse).toHaveBeenCalledWith({ accessToken: 't', refreshToken: 'r' });
    expect(ctx.body).toEqual({ ok: true });
  });

  it('refreshToken: should validate, call service, and map response', async () => {
    ctx.request.body = { userId: '1', refreshToken: 'r' };
    authService.refreshToken.mockResolvedValue({ accessToken: 't', refreshToken: 'r' });
    (AuthMapper.toLoginResponse as jest.Mock).mockReturnValue({ accessToken: 't', refreshToken: 'r' });
    (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
    await controller.refreshToken(ctx);
    expect(validateDto).toHaveBeenCalled();
    expect(authService.refreshToken).toHaveBeenCalledWith('1', 'r');
    expect(AuthMapper.toLoginResponse).toHaveBeenCalledWith('t', 'r');
    expect(ResponseMapper.okResponse).toHaveBeenCalledWith({ accessToken: 't', refreshToken: 'r' });
    expect(ctx.body).toEqual({ ok: true });
  });

  it('getPayload: should validate, call service, and map response (token in body)', async () => {
    ctx.request.body = { accessToken: 't' };
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

  it('getPayload: should use token from cookie if not in body', async () => {
    ctx.request.body = {};
    ctx.state.cookies.accessToken = 'cookie-token';
    authService.getPayload.mockResolvedValue({ id: '2', username: 'cookie', key: 'k2' });
    (AuthMapper.toPayloadResponse as jest.Mock).mockReturnValue({ id: '2', username: 'cookie', key: 'k2' });
    (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
    await controller.getPayload(ctx);
    expect(authService.getPayload).toHaveBeenCalledWith('cookie-token');
    expect(ctx.body).toEqual({ ok: true });
  });

  it('getPayload: should use token from Authorization header if not in body or cookie', async () => {
    ctx.request.body = {};
    ctx.state.cookies = {};
    ctx.headers.authorization = 'Bearer header-token';
    authService.getPayload.mockResolvedValue({ id: '3', username: 'header', key: 'k3' });
    (AuthMapper.toPayloadResponse as jest.Mock).mockReturnValue({ id: '3', username: 'header', key: 'k3' });
    (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
    await controller.getPayload(ctx);
    expect(authService.getPayload).toHaveBeenCalledWith('header-token');
    expect(ctx.body).toEqual({ ok: true });
  });

  it('getPayload: should throw UnauthorizedError if no token provided', async () => {
    ctx.request.body = {};
    ctx.state.cookies = {};
    ctx.headers = {};
    await expect(controller.getPayload(ctx)).rejects.toThrow(/Unauthorized|Token not provided/);
  });
});
