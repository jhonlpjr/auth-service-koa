export class UserRecoveryCode {
  id: string;
  userId: string;
  codeHash: string;
  used: boolean;
  createdAt: Date;

  constructor(data: Partial<UserRecoveryCode>) {
    this.id = data.id!;
    this.userId = data.userId!;
    this.codeHash = data.codeHash!;
    this.used = data.used ?? false;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }
}
