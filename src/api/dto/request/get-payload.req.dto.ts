import { IsString } from "class-validator";

export class GetPayloadReqDto {
  @IsString({message: 'Access Token invalid or not found'})
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}