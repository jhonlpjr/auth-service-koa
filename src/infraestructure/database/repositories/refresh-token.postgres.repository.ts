import crypto from 'crypto';
import { PostgresDB } from '../../../shared/utils/database';
import { DatabaseError } from '../../../shared/api/exceptions/database-error';
import logger from '../../../shared/utils/logger';

export class RefreshTokenRepositoryImpl {
  async save(userId: string, token: string, expiresAt: Date, jti: string) {
    try {
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      await PostgresDB.query(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, jti) VALUES ($1, $2, $3, $4)',
        [userId, hash, expiresAt, jti]
      );
    } catch (error) {
      logger.error('Error saving refresh token:', error);
      throw new DatabaseError(error);
    }
  }

  async findByJti(jti: string) {
    try {
      const res = await PostgresDB.query('SELECT * FROM refresh_tokens WHERE jti = $1', [jti]);
      return res.rows[0];
    } catch (error) {
      logger.error('Error finding refresh token by jti:', error);
      throw new DatabaseError(error);
    }
  }

  async revoke(jti: string) {
    try {
      await PostgresDB.query('DELETE FROM refresh_tokens WHERE jti = $1', [jti]);
    } catch (error) {
      logger.error('Error revoking refresh token:', error);
      throw new DatabaseError(error);
    }
  }

  async verify(userId: string, token: string) {
    try {
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const res = await PostgresDB.query(
        'SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2',
        [userId, hash]
      );
      return res.rows[0];
    } catch (error) {
      logger.error('Error verifying refresh token:', error);
      throw new DatabaseError(error);
    }
  }
}
