
import { Context } from "koa";
import { container } from '../../infrastructure/providers/container-config';
import { TYPES } from '../../infrastructure/providers/types';
import { MfaTotpService } from '../../application/service/mfa.totp.service';
import { AuthService } from '../../application/service/auth.service';
import { MfaMapper } from '../mappers/mfa.mapper';
import { ResponseMapper } from '../../shared/mappers/response.mapper';
import { validateDto } from '../../shared/utils/validators';
import { ActivateTotpReqDTO, VerifyTotpReqDTO, VerifyRecoveryReqDTO } from '../dto/request/mfa.req.dto';

export class MfaController {
    async setupTotp(ctx: Context) {
        const mfaService = container.get<MfaTotpService>(TYPES.MfaTotpService);
        const user = ctx.state.user;
        const body = ctx.request.body as { serviceName?: string };
        const serviceName = body?.serviceName || 'AuthService';
        const requestDto = MfaMapper.toSetupTotpReqDTO(user, serviceName);
        await validateDto(requestDto);
        const otpauthUrl = await mfaService.setupTotp(user.id, user.username || user.email, serviceName);
        ctx.body = ResponseMapper.okResponse(MfaMapper.toTotpSetupResponse(otpauthUrl));
    }

    async activateTotp(ctx: Context) {
        const mfaService = container.get<MfaTotpService>(TYPES.MfaTotpService);
        const userId = ctx.state.user.id;
        const requestDto = Object.assign(new ActivateTotpReqDTO(), ctx.request.body);
        await validateDto(requestDto);
        await mfaService.activateTotp(userId, requestDto.token);
        ctx.body = ResponseMapper.okResponse({ activated: true });
    }

    async verifyTotp(ctx: Context) {
        const mfaService = container.get<MfaTotpService>(TYPES.MfaTotpService);
        const authService = container.get<AuthService>(TYPES.AuthService);
        const userId = ctx.state.user.id;
        const requestDto = Object.assign(new VerifyTotpReqDTO(), ctx.request.body);
        await validateDto(requestDto);
        await mfaService.verifyTotpForUser(userId, requestDto.token);
        // Emitir tokens tras MFA exitoso
        const tokens = await authService.issueTokensForUserId(userId);
        ctx.body = ResponseMapper.okResponse(tokens);
    }

    async verifyRecovery(ctx: Context) {
        const mfaService = container.get<MfaTotpService>(TYPES.MfaTotpService);
        const authService = container.get<AuthService>(TYPES.AuthService);
        const userId = ctx.state.user.id;
        const requestDto = Object.assign(new VerifyRecoveryReqDTO(), ctx.request.body);
        await validateDto(requestDto);
        await mfaService.verifyRecoveryCode(userId, requestDto.code);
        // Emitir tokens tras MFA exitoso
        const tokens = await authService.issueTokensForUserId(userId);
        ctx.body = ResponseMapper.okResponse(tokens);
    }

    async listFactors(ctx: Context) {
        const mfaService = container.get<MfaTotpService>(TYPES.MfaTotpService);
        const userId = ctx.state.user.id;
        const factors = await mfaService.listFactors(userId);
        ctx.body = ResponseMapper.okResponse(factors.map(MfaMapper.toFactorResponse));
    }

}
