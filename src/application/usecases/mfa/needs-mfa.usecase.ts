import { injectable, inject } from "inversify";
import { TYPES } from '../../../infrastructure/providers/types';
import { MfaFactorsRepository } from "../../ports/repositories/mfa-factors.repository";
import { MfaTypes } from "../../../shared/enums/mfa-types.enum";
import { ACTIVE_STRING } from "../../../shared/constants/general.constants";

@injectable()
export class NeedsMfaUseCase {
    constructor(
        @inject(TYPES.MfaFactorsRepository) private mfaRepo: MfaFactorsRepository
    ) {}

    async execute(userId: string): Promise<boolean> {
        const factors = await this.mfaRepo.listByUser(userId);
        return factors.some(f => f.status === ACTIVE_STRING && f.type === MfaTypes.TOTP);
    }
}
