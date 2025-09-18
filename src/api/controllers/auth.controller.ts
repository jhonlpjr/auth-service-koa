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
        CookieUtils.setCookie(ctx, ACCESS_TOKEN, result.accessToken);
        ctx.body = ResponseMapper.okResponse(
            AuthMapper.toLoginResponse(result.accessToken, result.refreshToken)
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
        CookieUtils.setCookie(ctx, ACCESS_TOKEN, result.accessToken);
        ctx.body = ResponseMapper.okResponse(
            AuthMapper.toLoginResponse(result.accessToken, result.refreshToken)
        );
    }

    async getPayload(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const accessToken = TokenUtils.getTokenFromRequest(ctx, ACCESS_TOKEN);
        console.log('Access Token obtenido:', accessToken);
        if (!accessToken) {
            throw new UnauthorizedError(TOKEN_NOT_PROVIDED_ERROR);
        }
        const requestDto = new GetPayloadReqDto(accessToken);
        await validateDto(requestDto); // Lanza excepción si falla
        const result = await authService.getPayload(requestDto.accessToken);
        ctx.body = ResponseMapper.okResponse(
            AuthMapper.toPayloadResponse(result)
        );
    }

}