import { Context } from 'koa';
import redis from '../../infrastructure/providers/redis';
import { validateDto } from '../../shared/utils/validators';
import { LoginUseCase } from '../../application/usecases/auth/login.usecase';
import { RefreshTokenUseCase } from '../../application/usecases/auth/refresh-token.usecase';
import { GetPayloadUseCase } from '../../application/usecases/auth/get-payload.usecase';

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
import { NeedsMfaUseCase } from '../../application/usecases/mfa/needs-mfa.usecase';
import { RevokeTokenUseCase } from '../../application/usecases/auth/revoke-token.usecase';
import { MfaTypes } from '../../shared/enums/mfa-types.enum';
import { RedisConstants } from '../../shared/constants/redis.constants';
import Crypto from 'crypto';


export class AuthController {

    async login(ctx: Context) {
        const loginUseCase = container.get<LoginUseCase>(TYPES.LoginUseCase);
        const needsMfaUseCase = container.get<NeedsMfaUseCase>(TYPES.NeedsMfaUseCase);
        const requestBody = ctx.request.body as LoginReqDTO;
        const requestDto = new LoginReqDTO(requestBody.username, requestBody.password);
        await validateDto(requestDto); // Lanza excepción si falla
        const result = await loginUseCase.execute(requestDto.username, requestDto.password);
        // MFA: Si el usuario requiere MFA, responder step mfa
        const needsMfa = await needsMfaUseCase.execute(result.userId);
        if (needsMfa) {
            // Generar login_tx único (puedes usar uuid)
            const loginTx = Crypto.randomUUID();
            // Guardar loginTx en Redis asociado al userId, expira en 5 minutos
            await redis.set(RedisConstants.LOGIN_TX_PREFIX.concat(loginTx), result.userId, RedisConstants.EXPIRATION_TIME, RedisConstants.EXPIRATION_TIME_VALUE);
            ctx.body = ResponseMapper.okResponse(AuthMapper.toMfaLoginResponse(loginTx, [MfaTypes.TOTP, MfaTypes.RECOVERY]));
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
        const refreshTokenUseCase = container.get<RefreshTokenUseCase>(TYPES.RefreshTokenUseCase);
        const requestBody = ctx.request.body as { userId: string };
        const refreshToken = TokenUtils.getTokenFromRequest(ctx, REFRESH_TOKEN);
        if (!refreshToken) {
            throw new UnauthorizedError(REFRESH_TOKEN_NOT_PROVIDED_ERROR);
        }
        const requestDto = new RefreshTokenReqDTO(requestBody.userId, refreshToken);
        await validateDto(requestDto);
        const result = await refreshTokenUseCase.execute(requestDto.userId, requestDto.refreshToken);
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
        const getPayloadUseCase = container.get<GetPayloadUseCase>(TYPES.GetPayloadUseCase);
        const accessToken = TokenUtils.getTokenFromRequest(ctx, ACCESS_TOKEN);
        if (!accessToken) {
            throw new UnauthorizedError(TOKEN_NOT_PROVIDED_ERROR);
        }
        const requestDto = new GetPayloadReqDto(accessToken);
        await validateDto(requestDto); // Lanza excepción si falla
        const result = await getPayloadUseCase.execute(requestDto.accessToken);
        ctx.body = ResponseMapper.okResponse(
            AuthMapper.toPayloadResponse(result)
        );
    }

    async revoke(ctx: Context) {
        const revokeTokenUseCase = container.get<RevokeTokenUseCase>(TYPES.RevokeTokenUseCase);
        const { userId, jti } = ctx.request.body as { userId: string; jti?: string };
        const requestDto = new RevokeTokenReqDTO(userId, jti);
        await validateDto(requestDto);
        await revokeTokenUseCase.execute({ userId: requestDto.userId, jti: requestDto.jti });
        ctx.body = ResponseMapper.okResponse(AuthMapper.toRevokeResponse(true));
    }

    async jwks(ctx: Context) {
        ctx.body = await getJwks();
    }

}