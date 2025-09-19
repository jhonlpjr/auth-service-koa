export class LoggedUserDTO {
    constructor(
        public accessToken: string,
        public refreshToken: string,
        public userId: string,
        public expiresIn: number,
        public scope: string,
        public aud: string
    ) {}
}