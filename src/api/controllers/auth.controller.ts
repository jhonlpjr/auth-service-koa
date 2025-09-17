import { Context } from 'koa';
import { validateDto } from '../../shared/utils/validators';
import { AuthService } from '../../application/service/auth.service';
import { RefreshTokenReqDTO } from '../dto/request/refresh-token.req.dto';
import { container } from '../../infrastructure/providers/container-config';
import { TYPES } from '../../infrastructure/providers/types';
import { AuthMapper } from '../mappers/auth.mapper';
import { ResponseMapper } from '../../shared/mappers/response.mapper';
import { GetPayloadReqDto } from '../dto/request/get-payload.req.dto';
import { LoginReqDTO } from '../dto/request/login.req.dto';

import { CookieUtils } from '../../shared/utils/cookie.utils';
import { TokenUtils } from '../../shared/utils/token.utils';
import { UnauthorizedError } from '../../shared/api/exceptions/unauthorized-error';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../shared/constants/keys.constants';
import { REFRESH_TOKEN_NOT_PROVIDED_ERROR, TOKEN_NOT_PROVIDED_ERROR } from '../../shared/constants/errors.constants';


export class AuthController {
    async login(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const requestBody = ctx.request.body as LoginReqDTO;
        const requestDto = new LoginReqDTO(requestBody.username, requestBody.password);
        await validateDto(requestDto); // Lanza excepción si falla
        const result = await authService.login(requestDto.username, requestDto.password);
        // Set cookie httpOnly para navegadores (usando utilitario compartido)
        CookieUtils.setCookie(ctx, ACCESS_TOKEN, result.token);
        ctx.body = ResponseMapper.okResponse(
            AuthMapper.toLoginResponse(result.token, result.refreshToken)
        );
    }

    async refreshToken(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const requestBody = ctx.request.body as { userId: string };
        // Permite refreshToken en body o cookie usando utilitario dinámico
        const refreshToken = TokenUtils.getTokenFromRequest(ctx, REFRESH_TOKEN);
        if (!refreshToken) {
            throw new UnauthorizedError(REFRESH_TOKEN_NOT_PROVIDED_ERROR);
        }
        const requestDto = new RefreshTokenReqDTO(requestBody.userId, refreshToken);
        await validateDto(requestDto); // Lanza excepción si falla
        const result = await authService.refreshToken(requestDto.userId, requestDto.refreshToken);
        // Set cookie httpOnly para navegadores (usando utilitario compartido)
        CookieUtils.setCookie(ctx, ACCESS_TOKEN, result.token);
        ctx.body = ResponseMapper.okResponse(
            AuthMapper.toLoginResponse(result.token, result.refreshToken)
        );
    }

    async getPayload(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const token = TokenUtils.getTokenFromRequest(ctx, ACCESS_TOKEN);
        if (!token) {
            throw new UnauthorizedError(TOKEN_NOT_PROVIDED_ERROR);
        }
        const requestDto = new GetPayloadReqDto(token);
        await validateDto(requestDto); // Lanza excepción si falla
        const result = await authService.getPayload(requestDto.token);
        ctx.body = ResponseMapper.okResponse(
            AuthMapper.toPayloadResponse(result)
        );
    }

}