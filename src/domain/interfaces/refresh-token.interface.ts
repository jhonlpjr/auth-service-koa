export interface RefreshToken {
  user_id: string;
  token_hash: string;
  expires_at: Date;
  jti: string;
  created_at?: Date;
}
