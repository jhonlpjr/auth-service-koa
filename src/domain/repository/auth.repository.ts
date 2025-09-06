import { UserKey } from "../interfaces/user-key.interface";
import { UserLogin } from "../interfaces/user-login.interface";

export interface AuthRepository {
    getUserById(id: string): Promise<any>;
    getUserByUsername(username: string): Promise<UserLogin>;
    getUserByKey(key: string): Promise<UserKey>;
}