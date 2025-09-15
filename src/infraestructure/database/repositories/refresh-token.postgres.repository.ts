import crypto from 'crypto';
import { PostgresDB } from '../../../utils/database';

export class RefreshTokenRepository {
  async save(userId: string, token: string, expiresAt: Date, jti: string) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    await PostgresDB.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, jti) VALUES ($1, $2, $3, $4)',
      [userId, hash, expiresAt, jti]
    );
  }

  async findByJti(jti: string) {
  const res = await PostgresDB.query('SELECT * FROM refresh_tokens WHERE jti = $1', [jti]);
  return res.rows[0];
  }

  async revoke(jti: string) {
  await PostgresDB.query('DELETE FROM refresh_tokens WHERE jti = $1', [jti]);
  }

  async verify(userId: string, token: string) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const res = await PostgresDB.query(
      'SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2',
      [userId, hash]
    );
    return res.rows[0];
  }
}
