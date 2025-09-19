import { UserMfaFactor } from "../entities/user-mfa-factor.entity";

export interface MfaFactorsRepository {
  createPending(userId: string, type: 'totp', secretCiphertext: string): Promise<UserMfaFactor>;
  activateFactor(userId: string, type: 'totp'): Promise<void>;
  getActive(userId: string, type: 'totp'): Promise<UserMfaFactor | null>;
  getPending(userId: string, type: 'totp'): Promise<UserMfaFactor | null>;
  listByUser(userId: string): Promise<UserMfaFactor[]>;
  revokeFactor(id: string): Promise<void>;
}
