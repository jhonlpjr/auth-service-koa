import { injectable, inject } from "inversify";
import * as otplib from "otplib";
import * as base32 from "hi-base32";
import { randomBytes } from "crypto";
import { TYPES } from '../../../infrastructure/providers/types';
import { MfaFactorsRepository } from "../../ports/repositories/mfa-factors.repository";
import { MfaTypes } from "../../../shared/enums/mfa-types.enum";

@injectable()
export class SetupTotpUseCase {
    constructor(
        @inject(TYPES.MfaFactorsRepository) private mfaRepo: MfaFactorsRepository
    ) {}

    async execute(userId: string, username: string, serviceName: string): Promise<string> {
        const secret = base32.encode(randomBytes(20)).replace(/=+$/, "");
        const otpauthUrl = otplib.authenticator.keyuri(username, serviceName, secret);
        await this.mfaRepo.createPending(userId, MfaTypes.TOTP, secret);
        return otpauthUrl;
    }
}
