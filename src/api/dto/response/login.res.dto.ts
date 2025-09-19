export class LoginResDTO {
    constructor(
        public accessToken: string,
        public refreshToken: string,
        public expiresIn: number,
        public tokenType: string,
        public userId: string,
        public scope?: string,
        public aud?: string
    ) {}
}