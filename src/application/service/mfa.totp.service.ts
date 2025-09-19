import * as otplib from "otplib";
import * as base32 from "hi-base32";
import { randomBytes } from "crypto";
import { injectable, inject } from "inversify";
import { TYPES } from '../../infrastructure/providers/types';
import { MfaFactorsRepository } from '../../domain/repository/mfa-factors.repository';
import { RecoveryCodesRepository } from '../../domain/repository/recovery-codes.repository';

@injectable()
export class MfaTotpService {
    constructor(
        @inject(TYPES.MfaFactorsRepository) private mfaRepo: MfaFactorsRepository,
        @inject(TYPES.RecoveryCodesRepository) private recoveryRepo: RecoveryCodesRepository
    ) { }

    async setupTotp(userId: string, username: string, serviceName: string): Promise<string> {
        const secret = base32.encode(randomBytes(20)).replace(/=+$/, "");
        const otpauthUrl = otplib.authenticator.keyuri(username, serviceName, secret);
        await this.mfaRepo.createPending(userId, 'totp', secret);
        return otpauthUrl;
    }

    async activateTotp(userId: string, token: string): Promise<void> {
        // Buscar el factor pendiente, no el activo
        const pending = await this.mfaRepo.getPending?.(userId, 'totp');
        if (!pending) throw new Error('No pending TOTP setup');
        if (!otplib.authenticator.check(token, pending.secret)) throw new Error('Invalid TOTP');
        await this.mfaRepo.activateFactor(userId, 'totp');
    }

    async verifyTotpForUser(userId: string, token: string): Promise<void> {
        const active = await this.mfaRepo.getActive(userId, 'totp');
        if (!active) throw new Error('No active TOTP');
        if (!otplib.authenticator.check(token, active.secret)) throw new Error('Invalid TOTP');
    }

    async listFactors(userId: string) {
        return this.mfaRepo.listByUser(userId);
    }

    async verifyRecoveryCode(userId: string, code: string): Promise<void> {
        const result = await this.recoveryRepo.verifyCode(userId, code);
        if (!result.ok) throw new Error('Invalid recovery code');
        await this.recoveryRepo.markUsed(result.codeId!);
    }

    async needsMfa(userId: string): Promise<boolean> {
        const factors = await this.listFactors(userId);
        return factors.some(f => f.status === 'active' && f.type === 'totp');
    }


    maskSecret(secret: string): string {
        return secret.slice(0, 4) + "****" + secret.slice(-4);
    }
    
}
