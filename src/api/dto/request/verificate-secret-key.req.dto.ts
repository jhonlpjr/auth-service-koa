import { IsString } from "class-validator";

export class VerificateSecretKeyReqDto {
  @IsString({message: 'Secret key invalid or not found'})
  secret_key: string;

  constructor(secret_key: string) {
    this.secret_key = secret_key;
  }
}