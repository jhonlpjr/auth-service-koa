import { UserLogin } from "../../../../domain/interfaces/user-login.interface";
import { PostgresDB } from "../../../../shared/utils/database";
import logger from "../../../../shared/utils/logger";
import { DatabaseError } from "../../../../shared/exceptions/database-error";
import { User } from "../../../../domain/interfaces/user.interface";
import { UserRepository } from "../../../../application/ports/repositories/user.repository";

export class PgUserRepository implements UserRepository {
    async createUser(user: { username: string; email: string; password: string; key: string }): Promise<User> {
        try {
            const result = await PostgresDB.query(
                'INSERT INTO users (id, username, email, password, key, created_at) VALUES (uuid_generate_v4(), $1, $2, $3, $4, NOW()) RETURNING *',
                [user.username, user.email, user.password, user.key]
            );
            return result.rows[0] as User;
        } catch (error) {
            logger.error("Error creating user:", error as any);
            throw new DatabaseError(error);
        }
    }

    async getUserById(id: string): Promise<User> {
        try {
            const result = await PostgresDB.query('SELECT * FROM users WHERE id = $1', [id]);
            return result.rows[0] as User;
        }
        catch (error) {
            logger.error("Error fetching user by ID:", error as any);
            throw new DatabaseError(error);
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
            logger.error("Error fetching user by username:", error as any);
            throw new DatabaseError(error);
        }
    }
}
