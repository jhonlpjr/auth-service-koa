import { UserLogin } from "../interfaces/user-login.interface";

export interface UserRepository {
    getUserById(id: string): Promise<any>;
    getUserByUsername(username: string): Promise<UserLogin>;
    createUser(user: {
        username: string;
        email: string;
        password: string;
        key: string;
    }): Promise<any>;
}
