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


export class AuthController {
    async login(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const requestBody = ctx.request.body as LoginReqDTO;
        const requestDto = new LoginReqDTO(requestBody.username, requestBody.password);
        await validateDto(requestDto); // Lanza excepción si falla
        const result = await authService.login(requestDto.username, requestDto.password);
            ctx.body = ResponseMapper.okResponse(
                AuthMapper.toLoginResponse(result.token, result.refreshToken)
            );
    }

    async refreshToken(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const requestBody = ctx.request.body as { userId: string, refreshToken: string };
        const requestDto = new RefreshTokenReqDTO(requestBody.userId, requestBody.refreshToken);
        await validateDto(requestDto); // Lanza excepción si falla
        const result = await authService.refreshToken(requestDto.userId, requestDto.refreshToken);
            ctx.body = ResponseMapper.okResponse(
                AuthMapper.toLoginResponse(result.token, result.refreshToken)
            );
    }

    async getPayload(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const requestBody = ctx.request.body as { token: string };
        const requestDto = new GetPayloadReqDto(requestBody.token);
        await validateDto(requestDto); // Lanza excepción si falla
        const result = await authService.getPayload(requestDto.token);
            ctx.body = ResponseMapper.okResponse(
                AuthMapper.toPayloadResponse(result)
            );
    }

}