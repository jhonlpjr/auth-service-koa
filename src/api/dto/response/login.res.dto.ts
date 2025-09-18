export class LoginResDTO {
    constructor(
        public accessToken: string,
        public refreshToken: string
    ) {}
}