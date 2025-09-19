import { SetupTotpReqDTO } from '../dto/request/setup-totp.req.dto';
import { TotpSetupResDTO, MfaFactorResDTO } from '../dto/response/mfa.res.dto';

export namespace MfaMapper {
    export function toSetupTotpReqDTO(user: any, serviceName?: string) {
        const dto = new SetupTotpReqDTO();
        dto.serviceName = serviceName;
        return dto;
    }

    export function toTotpSetupResponse(otpauthUrl: string) {
        return new TotpSetupResDTO(otpauthUrl);
    }

    export function toFactorResponse(factor: any) {
        return new MfaFactorResDTO({
            id: factor.id,
            type: factor.type,
            status: factor.status,
            createdAt: factor.createdAt,
        });
    }
}
