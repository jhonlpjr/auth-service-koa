export interface RefreshToken {
  user_id: string;
  token_hash: string;
  expires_at: Date;
  jti: string;
  created_at?: Date;
  meta?: Record<string, any>;
  rotated?: boolean;
  used?: boolean;
  rotated_at?: Date;
  parent_jti?: string | null;
}
