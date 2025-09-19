import { Context } from 'koa';
import redis from '../../infrastructure/providers/redis';
import { validateDto } from '../../shared/utils/validators';
import { AuthService } from '../../application/service/auth.service';
import { RefreshTokenReqDTO } from '../dto/request/refresh-token.req.dto';
import { container } from '../../infrastructure/providers/container-config';
import { TYPES } from '../../infrastructure/providers/types';
import { AuthMapper } from '../mappers/auth.mapper';
import { ResponseMapper } from '../../shared/mappers/response.mapper';
import { GetPayloadReqDto } from '../dto/request/get-payload.req.dto';
import { RevokeTokenReqDTO } from '../dto/request/revoke-token.req.dto';
import { LoginReqDTO } from '../dto/request/login.req.dto';
import { TokenUtils } from '../../shared/utils/token.utils';
import { UnauthorizedError } from '../../shared/exceptions/unauthorized-error';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../shared/constants/keys.constants';
import { REFRESH_TOKEN_NOT_PROVIDED_ERROR, TOKEN_NOT_PROVIDED_ERROR } from '../../shared/constants/errors.constants';
import { getJwks } from '../../infrastructure/crypto/jwks.provider';
import { TokenType } from '../../shared/enums/token-type.enum';
import { DEFAULT_TOKEN_EXPIRATION } from '../../shared/constants/general.constants';
import logger from '../../shared/utils/logger';
import { MfaTotpService } from '../../application/service/mfa.totp.service';


export class AuthController {

    async login(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const mfaTotpService = container.get<MfaTotpService>(TYPES.MfaTotpService);
        const requestBody = ctx.request.body as LoginReqDTO;
        const requestDto = new LoginReqDTO(requestBody.username, requestBody.password);
        await validateDto(requestDto); // Lanza excepción si falla
        const result = await authService.login(requestDto.username, requestDto.password);
        // MFA: Si el usuario requiere MFA, responder step mfa
        const needsMfa = await mfaTotpService.needsMfa(result.userId);
        if (needsMfa) {
            // Generar login_tx único (puedes usar uuid)
            const loginTx = require('crypto').randomUUID();
            logger.info(`User ${result.userId} requires MFA, generated login_tx: ${loginTx}`);
            // Guardar loginTx en Redis asociado al userId, expira en 5 minutos
            await redis.set(`login_tx:${loginTx}`, result.userId, 'EX', 300);
            ctx.body = ResponseMapper.okResponse(AuthMapper.toMfaLoginResponse(loginTx, ['totp', 'recovery']));
            return;
        }
        ctx.body = ResponseMapper.okResponse(
            AuthMapper.toLoginResponse(
                result.accessToken,
                result.refreshToken,
                result.expiresIn || DEFAULT_TOKEN_EXPIRATION,
                TokenType.BEARER,
                result.userId,
                result.scope,
                result.aud
            )
        );
    }

    async refreshToken(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const requestBody = ctx.request.body as { userId: string };
        const refreshToken = TokenUtils.getTokenFromRequest(ctx, REFRESH_TOKEN);
        if (!refreshToken) {
            throw new UnauthorizedError(REFRESH_TOKEN_NOT_PROVIDED_ERROR);
        }
        const requestDto = new RefreshTokenReqDTO(requestBody.userId, refreshToken);
        await validateDto(requestDto);
        const result = await authService.refreshToken(requestDto.userId, requestDto.refreshToken);
        ctx.body = AuthMapper.toLoginResponse(
            result.accessToken,
            result.refreshToken,
            result.expiresIn || DEFAULT_TOKEN_EXPIRATION,
            TokenType.BEARER,
            result.userId,
            result.scope,
            result.aud
        );
    }

    async getPayload(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const accessToken = TokenUtils.getTokenFromRequest(ctx, ACCESS_TOKEN);
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

    async revoke(ctx: Context) {
        const authService = container.get<AuthService>(TYPES.AuthService);
        const body = ctx.request.body as Record<string, any>;
        const requestDto = new RevokeTokenReqDTO(body.userId, body.jti);
        await validateDto(requestDto);
        await authService.revoke({ userId: requestDto.userId, jti: requestDto.jti });
        ctx.body = ResponseMapper.okResponse(AuthMapper.toRevokeResponse(true));
    }

    async jwks(ctx: Context) {
        ctx.body = await getJwks();
    }

}