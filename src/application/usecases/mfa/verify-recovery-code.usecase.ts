import { injectable, inject } from "inversify";
import { TYPES } from '../../../infrastructure/providers/types';
import { RecoveryCodesRepository } from "../../ports/repositories/recovery-codes.repository";

@injectable()
export class VerifyRecoveryCodeUseCase {
    constructor(
        @inject(TYPES.RecoveryCodesRepository) private recoveryRepo: RecoveryCodesRepository
    ) {}

    async execute(userId: string, code: string): Promise<void> {
        const result = await this.recoveryRepo.verifyCode(userId, code);
        if (!result.ok) throw new Error('Invalid recovery code');
        await this.recoveryRepo.markUsed(result.codeId!);
    }
}
