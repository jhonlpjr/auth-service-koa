export class LoginResDTO {
    constructor(
        public token: string,
        public refreshToken: string
    ) {}
}