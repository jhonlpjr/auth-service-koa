import { Context } from 'koa';
import { TYPES } from '../providers/types';
import { container } from '../providers/container-config';
import { ERROR_INTERNAL_SERVER, UnauthorizedError } from '../../utils/error';
import { httpStatus } from '../../utils/http';
import { validate } from 'class-validator';
import { AuthService } from '../../application/service/auth.service';
import { LoginReqDTO } from '../../application/dto/request/login.req.dto';
import { VerificateSecretKeyReqDto } from '../../application/dto/request/verificate-secret-key.req.dto';
import { GetPayloadReqDto } from '../../application/dto/request/get-payload.req.dto';


export class AuthController {
    async login(ctx: Context) {

        try {
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
        
              ctx.status = httpStatus.OK;
              ctx.body = result;

            ctx.body = result;
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                ctx.status = httpStatus.UNAUTHORIZED;
                ctx.body = { error: error.message };
                return;
            }
            ctx.status = httpStatus.INTERNAL_SERVER_ERROR;
            ctx.body = { error: ERROR_INTERNAL_SERVER };
        }
    }

    async getPayload(ctx: Context) {
        try {
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
        } catch (error) {
            ctx.status = httpStatus.INTERNAL_SERVER_ERROR;
            ctx.body = { error: ERROR_INTERNAL_SERVER };
        }
    }

    async validateSecretKey(ctx: Context) {
        try {
            const authService = container.get<AuthService>(TYPES.AuthService);
            const requestBody = ctx.request.body as { secret_key: string };
            const requestDto = new VerificateSecretKeyReqDto(requestBody.secret_key);

            const errors = await validate(requestDto);

            if (errors.length > 0) {
                ctx.status = httpStatus.UNAUTHORIZED;
                ctx.body = { errors: errors.map(error => error.constraints) };
                return;
            }

            const result = await authService.validateSecretKey(requestDto.secret_key);
            ctx.status = httpStatus.OK;
            ctx.body = result;
        } catch (error) {
            ctx.status = httpStatus.INTERNAL_SERVER_ERROR;
            ctx.body = { error: ERROR_INTERNAL_SERVER };
        }
    }
}