import { injectable, inject } from "inversify";
import * as otplib from "otplib";
import { TYPES } from '../../../infrastructure/providers/types';
import { MfaFactorsRepository } from "../../ports/repositories/mfa-factors.repository";
import { MfaTypes } from "../../../shared/enums/mfa-types.enum";

@injectable()
export class ActivateTotpUseCase {
    constructor(
        @inject(TYPES.MfaFactorsRepository) private mfaRepo: MfaFactorsRepository
    ) {}

    async execute(userId: string, token: string): Promise<void> {
        const pending = await this.mfaRepo.getPending?.(userId, MfaTypes.TOTP);
        if (!pending) throw new Error('No pending TOTP setup');
        if (!otplib.authenticator.check(token, pending.secret)) throw new Error('Invalid TOTP');
        await this.mfaRepo.activateFactor(userId, MfaTypes.TOTP);
    }
}
