import { injectable, inject } from "inversify";
import { TYPES } from '../../../infrastructure/providers/types';
import { MfaFactorsRepository } from "../../ports/repositories/mfa-factors.repository";

@injectable()
export class ListFactorsUseCase {
    constructor(
        @inject(TYPES.MfaFactorsRepository) private mfaRepo: MfaFactorsRepository
    ) {}

    async execute(userId: string) {
        return this.mfaRepo.listByUser(userId);
    }
}
