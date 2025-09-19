export type MfaFactorType = 'totp' | 'webauthn' | 'recovery';
export type MfaFactorStatus = 'pending' | 'active' | 'revoked';

export class UserMfaFactor {
  id: string;
  userId: string;
  type: MfaFactorType;
  secret: string; // encrypted
  status: MfaFactorStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<UserMfaFactor>) {
    this.id = data.id!;
    this.userId = data.userId!;
    this.type = data.type!;
    this.secret = data.secret!;
    this.status = data.status!;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }
}

