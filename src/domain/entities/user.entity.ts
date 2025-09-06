import { User } from "../interfaces/user.interface";

export class UserEntity implements User {
    id: string;
    username: string;
    password: string;
    names: string;
    lastnames: string;
    created_at: Date;
    
    constructor(partial: Partial<UserEntity>) {
        this.id = partial.id || "";
        this.username = partial.username || "";
        this.password = partial.password || "";
        this.names = partial.names || "";
        this.lastnames = partial.lastnames || "";
        this.created_at = partial.created_at || new Date();
    }
}