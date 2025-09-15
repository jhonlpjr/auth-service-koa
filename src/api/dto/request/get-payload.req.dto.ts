import { IsString } from "class-validator";

export class GetPayloadReqDto {
  @IsString({message: 'Token key invalid or not found'})
  token: string;

  constructor(token: string) {
    this.token = token;
  }
}