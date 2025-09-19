import { RecoveryCodesRepository } from '../../domain/repository/recovery-codes.repository';
import { PostgresDB } from '../../shared/utils/database';
import { randomUUID, randomBytes } from 'crypto';
import * as argon2 from 'argon2';

function maskCode(code: string): string {
  return code.slice(0, 2) + '****' + code.slice(-2);
}

export class RecoveryCodesRepositoryImpl implements RecoveryCodesRepository {
  async generateCodes(userId: string, count = 8): Promise<string[]> {
    const codes: string[] = [];
    const masked: string[] = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
      const code = randomBytes(8).toString('hex');
      const codeHash = await argon2.hash(code);
      const id = randomUUID();
      await PostgresDB.query(
        `INSERT INTO user_recovery_codes (id, user_id, code_hash, used, created_at) VALUES ($1, $2, $3, 0, $4)` ,
        [id, userId, codeHash, now]
      );
      codes.push(code);
      masked.push(maskCode(code));
    }
    return masked;
  }

  async verifyCode(userId: string, code: string): Promise<{ ok: boolean; codeId?: string }> {
    const result = await PostgresDB.query(
      `SELECT id, code_hash FROM user_recovery_codes WHERE user_id=$1 AND used=0`,
      [userId]
    );
    for (const row of result.rows) {
      if (await argon2.verify(row.code_hash, code)) {
        return { ok: true, codeId: row.id };
      }
    }
    return { ok: false };
  }

  async markUsed(codeId: string): Promise<void> {
    await PostgresDB.query(
      `UPDATE user_recovery_codes SET used=1 WHERE id=$1`,
      [codeId]
    );
  }
}
