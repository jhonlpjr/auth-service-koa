import { UserKey } from "../../../domain/interfaces/user-key.interface";
import { UserLogin } from "../../../domain/interfaces/user-login.interface";
import { AuthRepository } from "../../../domain/repository/auth.repository";
import { PostgresDB } from "../../../utils/database";
import logger from "../../../utils/logger";


export class AuthRepositoryImpl implements AuthRepository {

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
            const result = await PostgresDB.query(`SELECT u.id, u.username, u.password, uk.secret_key "key"
                FROM "user" u inner join user_key uk
                ON u.id = uk.user_id 
                WHERE u.username = $1`, [username]);
            return result.rows[0] as UserLogin;
        } catch (error) {
            logger.error("Error fetching user by username:", error);
            throw new Error("Database error");
        }

    }

    async getUserByKey(key: string): Promise<UserKey> {
        try {
            const result = await PostgresDB.query('SELECT * FROM user_key WHERE secret_key = $1', [key]);
            return result.rows[0];
        } catch (error) {
            logger.error("Error fetching user by key:", error);
            throw new Error("Database error");
        }

    }
}