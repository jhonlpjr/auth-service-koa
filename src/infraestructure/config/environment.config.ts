// Para el endpoint de superusuario, agrega en tu archivo .env:
// SUPER_SECRET_KEY=tu_clave_super_secreta
import { REQUIRED_ENV_VARS } from "../../shared/constants/environments.constants";


export class Environment {
  static get(key: string): string {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      throw new Error(`[Environment] Missing required environment variable: ${key}`);
    }
    return value;
  }

  static validateAll() {
    REQUIRED_ENV_VARS.forEach(Environment.get);
  }
}