// Evita error de importación ES de jose en Jest
jest.mock('jose', () => ({
  importSPKI: jest.fn(),
  exportJWK: jest.fn()
}));
import { AuthController } from '../../../src/api/controllers/auth.controller';
import { LoginUseCase } from '../../../src/application/usecases/auth/login.usecase';
import { RefreshTokenUseCase } from '../../../src/application/usecases/auth/refresh-token.usecase';
import { GetPayloadUseCase } from '../../../src/application/usecases/auth/get-payload.usecase';
import { RevokeTokenUseCase } from '../../../src/application/usecases/auth/revoke-token.usecase';
import { container } from '../../../src/infrastructure/providers/container-config';
import { TYPES } from '../../../src/infrastructure/providers/types';
import { ResponseMapper } from '../../../src/shared/mappers/response.mapper';
import { AuthMapper } from '../../../src/api/mappers/auth.mapper';
import { validateDto } from '../../../src/shared/utils/validators';

import redis from '../../../src/infrastructure/providers/redis';

import * as Crypto from 'crypto';

// Mockear randomUUID globalmente para evitar redefinición
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn(() => '11111111-1111-1111-1111-111111111111')
}));

jest.mock('../../../src/infrastructure/providers/redis', () => ({
  set: jest.fn()
}));

jest.mock('../../../src/infrastructure/providers/container-config');
jest.mock('../../../src/shared/utils/validators');
jest.mock('../../../src/shared/mappers/response.mapper');
jest.mock('../../../src/api/mappers/auth.mapper');

describe('AuthController', () => {
  let controller: AuthController;
  let ctx: any;
  let loginUseCase: any;
  let refreshTokenUseCase: any;
  let getPayloadUseCase: any;
  let revokeTokenUseCase: any;
  let needsMfaUseCase: any;

  // randomUUID ya está mockeado globalmente

  beforeEach(() => {
    controller = new AuthController();
    ctx = {
      request: { body: {} },
      body: undefined,
      state: { cookies: {} }, // Mock cookies as empty object
      headers: {},
      cookies: { set: jest.fn() }, // Mock cookies.set for setCookie util
    };
    loginUseCase = { execute: jest.fn() };
    refreshTokenUseCase = { execute: jest.fn() };
    getPayloadUseCase = { execute: jest.fn() };
    revokeTokenUseCase = { execute: jest.fn() };
    needsMfaUseCase = { execute: jest.fn().mockResolvedValue(false) };
    (container.get as jest.Mock).mockImplementation((type) => {
      if (type === TYPES.LoginUseCase) return loginUseCase;
      if (type === TYPES.RefreshTokenUseCase) return refreshTokenUseCase;
      if (type === TYPES.GetPayloadUseCase) return getPayloadUseCase;
      if (type === TYPES.RevokeTokenUseCase) return revokeTokenUseCase;
      if (type === TYPES.NeedsMfaUseCase) return needsMfaUseCase;
      return undefined;
    });
    (validateDto as jest.Mock).mockResolvedValue(undefined);

  (Crypto.randomUUID as jest.Mock).mockClear();
  jest.clearAllMocks();
  });

  it('login: should validate, call service, and map response (with aud/scope)', async () => {
    ctx.request.body = { username: 'user', password: 'pass' };
    loginUseCase.execute.mockResolvedValue({ accessToken: 't', refreshToken: 'r', userId: 'u', expiresIn: 3600, scope: 'movies:read', aud: 'movies-api' });
    needsMfaUseCase.execute.mockResolvedValue(false); // asegurar flujo directo
    (AuthMapper.toLoginResponse as jest.Mock).mockReturnValue({
      access_token: 't',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'movies:read',
      aud: 'movies-api',
      refresh_token: 'r',
      user_id: 'u'
    });
    (ResponseMapper.okResponse as jest.Mock).mockImplementation((x) => x);
    await controller.login(ctx);
    expect(validateDto).toHaveBeenCalled();
    expect(loginUseCase.execute).toHaveBeenCalledWith('user', 'pass');
    expect(ctx.body).toEqual({
      access_token: 't',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'movies:read',
      aud: 'movies-api',
      refresh_token: 'r',
      user_id: 'u'
    });
  });

  it('login: should handle MFA step and respond with loginTx', async () => {
    ctx.request.body = { username: 'user', password: 'pass' };
    loginUseCase.execute.mockResolvedValue({ userId: 'u' });
    needsMfaUseCase.execute.mockResolvedValue(true);
    const fakeLoginTx = '11111111-1111-1111-1111-111111111111';
    (Crypto.randomUUID as jest.Mock).mockReturnValue(fakeLoginTx);
  (AuthMapper.toMfaLoginResponse as jest.Mock).mockReturnValue({ login_tx: fakeLoginTx, mfa: ['totp', 'recovery'] });
    (ResponseMapper.okResponse as jest.Mock).mockImplementation((x) => x);
    const redisSetSpy = jest.spyOn(redis, 'set').mockResolvedValue(undefined as any);

    await controller.login(ctx);
    expect(validateDto).toHaveBeenCalled();
    expect(loginUseCase.execute).toHaveBeenCalledWith('user', 'pass');
    expect(needsMfaUseCase.execute).toHaveBeenCalledWith('u');
    expect(redisSetSpy).toHaveBeenCalledWith(
      expect.stringContaining(fakeLoginTx),
      'u',
      expect.anything(),
      expect.anything()
    );
  expect(AuthMapper.toMfaLoginResponse).toHaveBeenCalledWith(fakeLoginTx, expect.arrayContaining(['totp', 'recovery']));
  expect(ctx.body).toEqual({ login_tx: fakeLoginTx, mfa: ['totp', 'recovery'] });
  });

  it('refreshToken: should validate, call service, and map response (with aud/scope)', async () => {
    ctx.request.body = { userId: '1', refreshToken: 'r' };
    refreshTokenUseCase.execute.mockResolvedValue({ accessToken: 't', refreshToken: 'r', userId: '1', expiresIn: 3600, scope: 'movies:read', aud: 'movies-api' });
    needsMfaUseCase.execute.mockResolvedValue(false); // asegurar flujo directo
    (AuthMapper.toLoginResponse as jest.Mock).mockReturnValue({
      access_token: 't',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'movies:read',
      aud: 'movies-api',
      refresh_token: 'r',
      user_id: '1'
    });
    await controller.refreshToken(ctx);
    expect(validateDto).toHaveBeenCalled();
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith('1', 'r');
    expect(ctx.body).toEqual({
      access_token: 't',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'movies:read',
      aud: 'movies-api',
      refresh_token: 'r',
      user_id: '1'
    });
  });

  it('getPayload: should validate, call service, and map response (token in body)', async () => {
    ctx.request.body = { accessToken: 't' };
    getPayloadUseCase.execute.mockResolvedValue({ id: '1', username: 'u', key: 'k' });
    (AuthMapper.toPayloadResponse as jest.Mock).mockReturnValue({ id: '1', username: 'u', key: 'k' });
    (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
    await controller.getPayload(ctx);
    expect(validateDto).toHaveBeenCalled();
    expect(getPayloadUseCase.execute).toHaveBeenCalledWith('t');
    expect(AuthMapper.toPayloadResponse).toHaveBeenCalledWith({ id: '1', username: 'u', key: 'k' });
    expect(ResponseMapper.okResponse).toHaveBeenCalledWith({ id: '1', username: 'u', key: 'k' });
    expect(ctx.body).toEqual({ ok: true });
  });

  it('getPayload: should use token from cookie if not in body', async () => {
    ctx.request.body = {};
    ctx.state.cookies.accessToken = 'cookie-token';
    getPayloadUseCase.execute.mockResolvedValue({ id: '2', username: 'cookie', key: 'k2' });
    (AuthMapper.toPayloadResponse as jest.Mock).mockReturnValue({ id: '2', username: 'cookie', key: 'k2' });
    (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
    await controller.getPayload(ctx);
    expect(getPayloadUseCase.execute).toHaveBeenCalledWith('cookie-token');
    expect(ctx.body).toEqual({ ok: true });
  });

  it('getPayload: should use token from Authorization header if not in body or cookie', async () => {
    ctx.request.body = {};
    ctx.state.cookies = {};
    ctx.headers.authorization = 'Bearer header-token';
    getPayloadUseCase.execute.mockResolvedValue({ id: '3', username: 'header', key: 'k3' });
    (AuthMapper.toPayloadResponse as jest.Mock).mockReturnValue({ id: '3', username: 'header', key: 'k3' });
    (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
    await controller.getPayload(ctx);
    expect(getPayloadUseCase.execute).toHaveBeenCalledWith('header-token');
    expect(ctx.body).toEqual({ ok: true });
  });

  it('getPayload: should throw UnauthorizedError if no token provided', async () => {
    ctx.request.body = {};
    ctx.state.cookies = {};
    ctx.headers = {};
    await expect(controller.getPayload(ctx)).rejects.toThrow(/Unauthorized|Token not provided/);
  });
});
