import { IsOptional, ValidateIf, IsString } from 'class-validator';

export class RevokeTokenReqDTO {
    @ValidateIf(o => !o.jti)
    @IsString({ message: 'userId must be a string' })
    @IsOptional()
    userId?: string;

    @ValidateIf(o => !o.userId)
    @IsString({ message: 'jti must be a string' })
    @IsOptional()
    jti?: string;

    constructor(userId?: string, jti?: string) {
        this.userId = userId;
        this.jti = jti;
    }
}
