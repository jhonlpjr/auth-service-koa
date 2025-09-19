import crypto from 'crypto';
import { PostgresDB } from '../../../shared/utils/database';
import { DatabaseError } from '../../../shared/exceptions/database-error';
import logger from '../../../shared/utils/logger';
import { RefreshTokenRepository } from '../../../domain/repository/refresh-token.repository';

export class RefreshTokenRepositoryImpl implements RefreshTokenRepository {
  async save(userId: string, token: string, expiresAt: Date, jti: string, meta: Record<string, any> = {}, parentJti: string | null = null) {
    try {
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      await PostgresDB.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, jti, meta, rotated, used, rotated_at, parent_jti) 
         VALUES ($1, $2, $3, $4, $5, FALSE, FALSE, NULL, $6)` ,
        [userId, hash, expiresAt, jti, JSON.stringify(meta), parentJti]
      );
    } catch (error) {
      logger.error('Error saving refresh token:', error as any);
      throw new DatabaseError(error);
    }
  }

  async findByJti(jti: string) {
    try {
      const res = await PostgresDB.query('SELECT * FROM refresh_tokens WHERE jti = $1', [jti]);
      return res.rows[0];
    } catch (error) {
      logger.error('Error finding refresh token by jti:', error as any);
      throw new DatabaseError(error);
    }
  }

  async findByParentJti(parentJti: string) {
    try {
      const res = await PostgresDB.query('SELECT * FROM refresh_tokens WHERE parent_jti = $1', [parentJti]);
      return res.rows;
    } catch (error) {
      logger.error('Error finding refresh tokens by parent_jti:', error as any);
      throw new DatabaseError(error);
    }
  }

  async revoke(jti: string) {
    try {
      await PostgresDB.query('DELETE FROM refresh_tokens WHERE jti = $1', [jti]);
    } catch (error) {
      logger.error('Error revoking refresh token:', error as any);
      throw new DatabaseError(error);
    }
  }

  async revokeByUserId(userId: string) {
    try {
      await PostgresDB.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    } catch (error) {
      logger.error('Error revoking refresh tokens by userId:', error as any);
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
      logger.error('Error verifying refresh token:', error as any);
      throw new DatabaseError(error);
    }
  }

  async markAsUsed(jti: string) {
    try {
      await PostgresDB.query('UPDATE refresh_tokens SET used = TRUE WHERE jti = $1', [jti]);
    } catch (error) {
      logger.error('Error marking refresh token as used:', error as any);
      throw new DatabaseError(error);
    }
  }

  async markAsRotated(jti: string) {
    try {
      await PostgresDB.query('UPDATE refresh_tokens SET rotated = TRUE, rotated_at = NOW() WHERE jti = $1', [jti]);
    } catch (error) {
      logger.error('Error marking refresh token as rotated:', error as any);
      throw new DatabaseError(error);
    }
  }
}
