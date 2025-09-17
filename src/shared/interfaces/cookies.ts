export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  domain?: string;
  maxAge?: number;
  path?: string;
}