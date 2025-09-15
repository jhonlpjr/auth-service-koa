import { User } from "../../../../domain/interfaces/user.interface";

export class UserLoggedResDTO {
    token: string;
    user: User;
    key: string;
    constructor(token: string, user: User) {
        this.token = token;
        this.user = user;
        this.key = user.key;
    }
}
