export class TotpSetupResDTO {
  otpauthUrl: string;
  constructor(otpauthUrl: string) {
    this.otpauthUrl = otpauthUrl;
  }
}

export class MfaFactorResDTO {
  id: string;
  type: string;
  status: string;
  createdAt: Date;
  constructor(data: Partial<MfaFactorResDTO>) {
    this.id = data.id!;
    this.type = data.type!;
    this.status = data.status!;
    this.createdAt = data.createdAt!;
  }
}
