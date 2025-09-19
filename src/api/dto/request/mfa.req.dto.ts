import { IsString, IsNotEmpty } from 'class-validator';

export class ActivateTotpReqDTO {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class VerifyTotpReqDTO {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class VerifyRecoveryReqDTO {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
