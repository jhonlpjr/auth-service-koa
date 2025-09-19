import { inject } from "inversify";
import { LoginUseCase } from "../usecases/login.usecase";
import { TYPES } from "../../infrastructure/providers/types";
import logger from "../../shared/utils/logger";
import { GetPayloadUseCase } from "../usecases/get-payload.usecase";
import { RefreshTokenUseCase } from "../usecases/refresh-token.usecase";
import { injectable } from "inversify";
import { PayloadDTO } from "../dto/payload.dto";
import { LoggedUserDTO } from "../dto/logged-user.dto";
import { UserRepository } from '../../domain/repository/user.repository';
import { IssueTokensForUserIdUseCase } from '../usecases/issue-tokens-for-user-id.usecase';

@injectable()
export class AuthService {
    constructor(
        @inject(TYPES.LoginUseCase) private loginUseCase: LoginUseCase,
        @inject(TYPES.GetPayloadUseCase) private getPayloadUseCase: GetPayloadUseCase,
        @inject(TYPES.RefreshTokenUseCase) private refreshTokenUseCase: RefreshTokenUseCase,
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.IssueTokensForUserIdUseCase) private issueTokensForUserIdUseCase: IssueTokensForUserIdUseCase
    ) { }

    public async login(username: string, password: string): Promise<LoggedUserDTO> {
        try {
            const result = await this.loginUseCase.execute(username, password);
            return result;
        } catch (error) {
            logger.error(`Login failed: ${error}`);
            throw error;
        }

    }

    public async getPayload(token: string): Promise<PayloadDTO> {
        try {
            const result = await this.getPayloadUseCase.execute(token);
            return result;
        } catch (error) {
            logger.error(`Error getting payload: ${error}`);
            throw error;
        }
    }

    public async refreshToken(userId: string, refreshToken: string): Promise<LoggedUserDTO> {
        try {
            const result = await this.refreshTokenUseCase.execute(userId, refreshToken);
            return result;
        } catch (error) {
            logger.error(`Refresh token failed: ${error}`);
            throw error;
        }
    }

    public async revoke({ userId, jti }: { userId?: string, jti?: string }): Promise<void> {
        if (jti) {
            await this.refreshTokenUseCase.revokeByJti(jti);
        }
        if (userId) {
            await this.refreshTokenUseCase.revokeByUserId(userId);
        }
    }

    /**
     * Emite un nuevo par de tokens (access y refresh) para un usuario dado su userId.
     * Útil para flujos como verificación MFA exitosa o administración.
     * Actualmente no se usa en ningún controller, pero puede ser útil para futuros flujos.
     */
    public async issueTokensForUserId(userId: string): Promise<LoggedUserDTO> {
        return this.issueTokensForUserIdUseCase.execute(userId);
    }

    public async getUserById(userId: string) {
        return this.userRepository.getUserById(userId);
    }

}