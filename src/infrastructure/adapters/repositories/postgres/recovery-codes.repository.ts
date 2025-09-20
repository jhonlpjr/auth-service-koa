import { PostgresDB } from '../../../../shared/utils/database';
import { randomUUID, randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { RecoveryCodesRepository } from '../../../../application/ports/repositories/recovery-codes.repository';
import { BASE8, HEXADECIMAL } from '../../../../shared/constants/general.constants';

function maskCode(code: string): string {
  return code.slice(0, 2) + '****' + code.slice(-2);
}

export class PgRecoveryCodesRepository implements RecoveryCodesRepository {
  async generateCodes(userId: string, count = 8): Promise<string[]> {
    const codes: string[] = [];
    const masked: string[] = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
      const code = randomBytes(BASE8).toString(HEXADECIMAL);
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
