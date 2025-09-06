import { IsString, MaxLength, MinLength } from "class-validator";

export class LoginReqDTO {
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    username: string;
    @IsString()
    @MinLength(6)
    password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}