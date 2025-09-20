
import { Context } from "koa";
import { container } from '../../infrastructure/providers/container-config';
import { TYPES } from '../../infrastructure/providers/types';
import { SetupTotpUseCase } from '../../application/usecases/mfa/setup-totp.usecase';
import { ActivateTotpUseCase } from '../../application/usecases/mfa/activate-totp.usecase';
import { VerifyTotpUseCase } from '../../application/usecases/mfa/verify-totp.usecase';
import { ListFactorsUseCase } from '../../application/usecases/mfa/list-factors.usecase';
import { VerifyRecoveryCodeUseCase } from '../../application/usecases/mfa/verify-recovery-code.usecase';
import { IssueTokensForUserIdUseCase } from '../../application/usecases/auth/issue-tokens-for-user-id.usecase';
import { MfaMapper } from '../mappers/mfa.mapper';
import { ResponseMapper } from '../../shared/mappers/response.mapper';
import { validateDto } from '../../shared/utils/validators';
import { ActivateTotpReqDTO, VerifyTotpReqDTO, VerifyRecoveryReqDTO } from '../dto/request/mfa.req.dto';

export class MfaController {
    async setupTotp(ctx: Context) {
        const setupTotp = container.get<SetupTotpUseCase>(TYPES.SetupTotpUseCase);
        const user = ctx.state.user;
        const body = ctx.request.body as { serviceName?: string };
        const serviceName = body?.serviceName || 'AuthService';
        const requestDto = MfaMapper.toSetupTotpReqDTO(user, serviceName);
        await validateDto(requestDto);
        const otpauthUrl = await setupTotp.execute(user.id, user.username || user.email, serviceName);
        ctx.body = ResponseMapper.okResponse(MfaMapper.toTotpSetupResponse(otpauthUrl));
    }

    async activateTotp(ctx: Context) {
        const activateTotp = container.get<ActivateTotpUseCase>(TYPES.ActivateTotpUseCase);
        const userId = ctx.state.user.id;
        const requestDto = Object.assign(new ActivateTotpReqDTO(), ctx.request.body);
        await validateDto(requestDto);
        await activateTotp.execute(userId, requestDto.token);
        ctx.body = ResponseMapper.okResponse({ activated: true });
    }

    async verifyTotp(ctx: Context) {
        const verifyTotp = container.get<VerifyTotpUseCase>(TYPES.VerifyTotpUseCase);
        const issueTokens = container.get<IssueTokensForUserIdUseCase>(TYPES.IssueTokensForUserIdUseCase);
        const userId = ctx.state.user.id;
        const requestDto = Object.assign(new VerifyTotpReqDTO(), ctx.request.body);
        await validateDto(requestDto);
        await verifyTotp.execute(userId, requestDto.token);
        // Issue tokens after successful MFA
        const tokens = await issueTokens.execute(userId);
        ctx.body = ResponseMapper.okResponse(tokens);
    }

    async verifyRecovery(ctx: Context) {
        const verifyRecovery = container.get<VerifyRecoveryCodeUseCase>(TYPES.VerifyRecoveryCodeUseCase);
        const issueTokens = container.get<IssueTokensForUserIdUseCase>(TYPES.IssueTokensForUserIdUseCase);
        const userId = ctx.state.user.id;
        const requestDto = Object.assign(new VerifyRecoveryReqDTO(), ctx.request.body);
        await validateDto(requestDto);
        await verifyRecovery.execute(userId, requestDto.code);
        // Issue tokens after successful MFA
        const tokens = await issueTokens.execute(userId);
        ctx.body = ResponseMapper.okResponse(tokens);
    }

    async listFactors(ctx: Context) {
        const listFactors = container.get<ListFactorsUseCase>(TYPES.ListFactorsUseCase);
        const userId = ctx.state.user.id;
        const factors = await listFactors.execute(userId);
        ctx.body = ResponseMapper.okResponse(factors.map(MfaMapper.toFactorResponse));
    }

}
