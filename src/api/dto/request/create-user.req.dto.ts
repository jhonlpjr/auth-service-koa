import { IsString } from "class-validator";

export class CreateUserDTO {
    @IsString()
    username: string;

    @IsString()
    email: string;

    @IsString()
    password: string;

    key?: string;

    constructor(username: string, email: string, password: string, key?: string) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.key = key;
    }
}