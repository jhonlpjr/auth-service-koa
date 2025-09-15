export interface User {
  id: string;
  username: string;
  password?: string;
  key: string;
  created_at?: Date;
}
