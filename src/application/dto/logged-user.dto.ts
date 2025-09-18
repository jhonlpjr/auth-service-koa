export class LoggedUserDTO {
    constructor(
        public accessToken: string,
        public refreshToken: string,
    ) {}
}   