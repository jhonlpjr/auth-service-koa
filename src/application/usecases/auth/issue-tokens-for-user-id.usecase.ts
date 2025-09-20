import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/providers/types";
import { LoggedUserDTO } from "../../dto/logged-user.dto";
import { TokenUtils } from '../../../shared/utils/token.utils';
import { REFRESH_TOKEN_EXPIRATION_MS } from '../../../shared/constants/refresh-token.constants';
import crypto from 'crypto';
import { USER_NOT_FOUND_ERROR } from "../../../shared/constants/errors.constants";
import { NotFoundError } from "../../../shared/exceptions/not-found-error";
import { Environment } from "../../../infrastructure/config/environment.config";
import { ENV } from "../../../shared/constants/environments.constants";
import { BASE64, HEXADECIMAL, MILISECONDS_IN_A_SECOND } from "../../../shared/constants/general.constants";
import { RefreshTokenRepository } from "../../ports/repositories/refresh-token.repository";
import { UserRepository } from "../../ports/repositories/user.repository";

@injectable()
export class IssueTokensForUserIdUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.RefreshTokenRepository) private refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(userId: string): Promise<LoggedUserDTO> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new NotFoundError(USER_NOT_FOUND_ERROR);
    // Generar el token JWT
    const payload = {
      id: user.id,
      username: user.username,
      key: user.key,
      aud: Environment.get(ENV.JWT_DEFAULT_AUD),
      scope: Environment.get(ENV.JWT_DEFAULT_SCOPE),
    };
    const token = TokenUtils.signJwtToken(payload);
    // Generar refresh token rotativo
    const refreshToken = crypto.randomBytes(BASE64).toString(HEXADECIMAL);
    const jti = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS);
    await this.refreshTokenRepository.save(user.id, refreshToken, expiresAt, jti, {}, null);
    // Retornar DTO
    return new LoggedUserDTO(
      token,
      refreshToken,
      user.id,
      Math.floor(REFRESH_TOKEN_EXPIRATION_MS / MILISECONDS_IN_A_SECOND),
      payload.scope,
      payload.aud
    );
  }
}
