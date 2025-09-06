import { UserPayload } from './../interfaces/user-payload.interface';
export class UserPayloadEntity implements UserPayload {
    id: string;
    username: string;
    key: string;

    constructor(partial: Partial<UserPayloadEntity>) {
        this.id = partial.id || "";
        this.username = partial.username || "";
        this.key = partial.key || "";
    }
}