import { Context } from 'koa';
import { ERROR_INTERNAL_SERVER, UnauthorizedError } from '../../utils/error';
import { httpStatus } from '../../utils/http';
import { validate } from 'class-validator';
import { AuthService } from '../../application/service/auth.service';
import { LoginReqDTO } from '../../presentation/http/dto/request/login.req.dto';
// import eliminado: VerificateSecretKeyReqDto
import { GetPayloadReqDto } from '../../presentation/http/dto/request/get-payload.req.dto';
import { RefreshTokenUseCase } from '../../application/usecases/refresh-token.usecase';
import { container } from '../../infraestructure/providers/container-config';
import { TYPES } from '../../infraestructure/providers/types';


export class AuthController {
    async login(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const requestBody = ctx.request.body as LoginReqDTO;
        const requestDto = new LoginReqDTO(requestBody.username, requestBody.password);
        const errors = await validate(requestDto);
        if (errors.length > 0) {
            ctx.status = httpStatus.UNAUTHORIZED;
            ctx.body = { errors: errors.map(error => error.constraints) };
            return;
        }
        const result = await authService.login(requestDto);
        ctx.body = result;
    }

    async refreshToken(ctx: Context) {
        const { userId, refreshToken } = ctx.request.body as { userId: string, refreshToken: string };
        const usecase = new RefreshTokenUseCase();
        const result = await usecase.execute(userId, refreshToken);
        ctx.status = httpStatus.OK;
        ctx.body = result;
    }

    async getPayload(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const requestBody = ctx.request.body as { token: string };
        const requestDto = new GetPayloadReqDto(requestBody.token);
        const errors = await validate(requestDto);
        if (errors.length > 0) {
            ctx.status = httpStatus.UNAUTHORIZED;
            ctx.body = { errors: errors.map(error => error.constraints) };
            return;
        }
        const result = await authService.getPayload(requestDto.token);
        ctx.status = httpStatus.OK;
        ctx.body = result;
    }

    // método validateSecretKey eliminado
}