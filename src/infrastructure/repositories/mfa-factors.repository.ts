import { MfaFactorsRepository } from '../../domain/repository/mfa-factors.repository';
import { UserMfaFactor, MfaFactorType } from '../../domain/entities/user-mfa-factor.entity';
import { PostgresDB } from '../../shared/utils/database';
import { randomUUID } from 'crypto';

export class MfaFactorsRepositoryImpl implements MfaFactorsRepository {
  async getPending(userId: string, type: MfaFactorType): Promise<UserMfaFactor | null> {
    const result = await PostgresDB.query(
      `SELECT * FROM user_mfa_factors WHERE user_id=$1 AND type=$2 AND status='pending'`,
      [userId, type]
    );
    return result.rows[0] ? (result.rows[0] as UserMfaFactor) : null;
  }
  async createPending(userId: string, type: MfaFactorType, secretCiphertext: string): Promise<UserMfaFactor> {
    const id = randomUUID();
    const now = new Date();
    const result = await PostgresDB.query(
      `INSERT INTO user_mfa_factors (id, user_id, type, secret, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6) RETURNING *`,
      [id, userId, type, secretCiphertext, now, now]
    );
    return result.rows[0] as UserMfaFactor;
  }

  async activateFactor(userId: string, type: MfaFactorType): Promise<void> {
    await PostgresDB.query(
      `UPDATE user_mfa_factors SET status='active', updated_at=$1 WHERE user_id=$2 AND type=$3 AND status='pending'`,
      [new Date(), userId, type]
    );
  }

  async getActive(userId: string, type: MfaFactorType): Promise<UserMfaFactor | null> {
    const result = await PostgresDB.query(
      `SELECT * FROM user_mfa_factors WHERE user_id=$1 AND type=$2 AND status='active'`,
      [userId, type]
    );
    return result.rows[0] ? (result.rows[0] as UserMfaFactor) : null;
  }

  async listByUser(userId: string): Promise<UserMfaFactor[]> {
    const result = await PostgresDB.query(
      `SELECT * FROM user_mfa_factors WHERE user_id=$1 AND status!='revoked'`,
      [userId]
    );
    return result.rows as UserMfaFactor[];
  }

  async revokeFactor(id: string): Promise<void> {
    await PostgresDB.query(
      `UPDATE user_mfa_factors SET status='revoked', updated_at=$1 WHERE id=$2`,
      [new Date(), id]
    );
  }
}
