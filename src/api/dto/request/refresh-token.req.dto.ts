import { IsString, IsNotEmpty } from "class-validator";

export class RefreshTokenReqDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  refreshToken!: string;

  constructor(userId: string, refreshToken: string) {
    this.userId = userId;
    this.refreshToken = refreshToken;
  }
}
