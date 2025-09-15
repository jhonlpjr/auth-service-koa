import { UserLogin } from "../../../domain/interfaces/user-login.interface";
import { UserRepository } from "../../../domain/repository/user.repository";
import { PostgresDB } from "../../../utils/database";
import logger from "../../../utils/logger";

export class UserRepositoryImpl implements UserRepository {
    async createUser(user: { username: string; email: string; password: string; key: string }): Promise<any> {
        try {
            const result = await PostgresDB.query(
                'INSERT INTO users (id, username, email, password, key, created_at) VALUES (uuid_generate_v4(), $1, $2, $3, $4, NOW()) RETURNING *',
                [user.username, user.email, user.password, user.key]
            );
            return result.rows[0];
        } catch (error) {
            logger.error("Error creating user:", error);
            throw new Error("Database error");
        }
    }

    async getUserById(id: string): Promise<any> {
        try {
            const result = await PostgresDB.query('SELECT * FROM users WHERE id = $1', [id]);
            return result.rows[0];
        }
        catch (error) {
            logger.error("Error fetching user by ID:", error);
            throw new Error("Database error");
        }
    }

    async getUserByUsername(username: string): Promise<UserLogin> {
        try {
            const result = await PostgresDB.query(
                'SELECT id, username, password, key FROM users WHERE username = $1',
                [username]
            );
            return result.rows[0] as UserLogin;
        } catch (error) {
            logger.error("Error fetching user by username:", error);
            throw new Error("Database error");
        }
    }
}
