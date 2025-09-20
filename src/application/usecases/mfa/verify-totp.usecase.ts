import { injectable, inject } from "inversify";
import * as otplib from "otplib";
import { TYPES } from '../../../infrastructure/providers/types';
import { MfaFactorsRepository } from "../../ports/repositories/mfa-factors.repository";
import { MfaTypes } from "../../../shared/enums/mfa-types.enum";

@injectable()
export class VerifyTotpUseCase {
    constructor(
        @inject(TYPES.MfaFactorsRepository) private mfaRepo: MfaFactorsRepository
    ) {}

    async execute(userId: string, token: string): Promise<void> {
        const active = await this.mfaRepo.getActive(userId, MfaTypes.TOTP);
        if (!active) throw new Error('No active TOTP');
        if (!otplib.authenticator.check(token, active.secret)) throw new Error('Invalid TOTP');
    }
}
