import { RefreshToken } from "../interfaces/refresh-token.interface";

export interface RefreshTokenRepository {
  save(userId: string, token: string, expiresAt: Date, jti: string): Promise<void>;
  findByJti(jti: string): Promise<RefreshToken | null>;
  revoke(jti: string): Promise<void>;
  verify(userId: string, token: string): Promise<RefreshToken | null>;
}
