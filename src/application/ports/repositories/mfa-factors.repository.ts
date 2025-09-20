import { UserMfaFactor } from "../../../domain/entities/user-mfa-factor.entity";
import { MfaTypes } from "../../../shared/enums/mfa-types.enum";

export interface MfaFactorsRepository {
  createPending(userId: string, type: MfaTypes.TOTP, secretCiphertext: string): Promise<UserMfaFactor>;
  activateFactor(userId: string, type: MfaTypes.TOTP): Promise<void>;
  getActive(userId: string, type: MfaTypes.TOTP): Promise<UserMfaFactor | null>;
  getPending(userId: string, type: MfaTypes.TOTP): Promise<UserMfaFactor | null>;
  listByUser(userId: string): Promise<UserMfaFactor[]>;
  revokeFactor(id: string): Promise<void>;
}
