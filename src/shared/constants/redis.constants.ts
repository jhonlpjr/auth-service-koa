export namespace RedisConstants {
    export const RATE_LIMIT_PREFIX = 'rate_limit:';
    export const BLOCKED_IPS_SET = 'blocked_ips';
    export const USER_LOGIN_ATTEMPTS_PREFIX = 'user_login_attempts:';
    export const IP_PREFIX = 'ip:';
    export const USER_PREFIX = 'user:';
    export const USER_TX_PREFIX = 'user_tx:';
    export const GLOBAL_RATE_LIMIT_KEY = `${RATE_LIMIT_PREFIX}global`;
    export const LOGIN_RATE_LIMIT_KEY = `${RATE_LIMIT_PREFIX}login`;
    export const PASSWORD_RESET_RATE_LIMIT_KEY = `${RATE_LIMIT_PREFIX}password_reset`;
    export const EMAIL_VERIFICATION_RATE_LIMIT_KEY = `${RATE_LIMIT_PREFIX}email_verification`;
    export const MAX_LOGIN_ATTEMPTS = 5; // Número máximo de intentos de login antes de bloquear
    export const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // Ventana de tiempo para contar intentos (15 minutos)
    export const BLOCK_DURATION_MS = 30 * 60 * 1000; // Duración del bloqueo (30 minutos)
    export const LOGIN_TX_PREFIX = 'login_tx:';
    export const WINDOWS_MS = 60_000; // 1 minuto
    export const MAX_TWENTY_REQUESTS = 20;
    export const MAX_TEN_REQUESTS = 10;
    export const GLOBAL_SCOPE = 'global';
    export const LOGIN_SCOPE = 'login';
    export const UNKNOWN_IP = 'unknown';
    export const ONE_REQUEST = 1;
}