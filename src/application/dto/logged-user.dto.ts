export class LoggedUserDTO {
    constructor(
        public token: string,
        public refreshToken: string,
    ) {}
}   