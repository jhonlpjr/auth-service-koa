import { RefreshToken } from "../../../domain/interfaces/refresh-token.interface";

export interface RefreshTokenRepository {
  save(
    userId: string,
    token: string,
    expiresAt: Date,
    jti: string,
    meta?: Record<string, any>,
    parentJti?: string | null
  ): Promise<void>;
  findByJti(jti: string): Promise<RefreshToken | null>;
  findByParentJti(parentJti: string): Promise<RefreshToken[]>;
  revoke(jti: string): Promise<void>;
  revokeByUserId(userId: string): Promise<void>;
  verify(userId: string, token: string): Promise<RefreshToken | null>;
  markAsUsed(jti: string): Promise<void>;
  markAsRotated(jti: string): Promise<void>;
}
