import { IsString, IsOptional } from 'class-validator';

export class SetupTotpReqDTO {
  @IsString()
  @IsOptional()
  serviceName?: string;
}
