import { inject } from "inversify";
import { LoginUseCase } from "../usecases/login.usecase";
import { TYPES } from "../../infraestructure/providers/types";
import logger from "../../shared/utils/logger";
import { GetPayloadUseCase } from "../usecases/get-payload.usecase";
import { RefreshTokenUseCase } from "../usecases/refresh-token.usecase";
import { injectable } from "inversify";
import { PayloadDTO } from "../dto/payload.dto";
import { LoggedUserDTO } from "../dto/logged-user.dto";
import { LoginReqDTO } from "../../api/dto/request/login.req.dto";

@injectable()
export class AuthService {
    constructor(
        @inject(TYPES.LoginUseCase) private loginUseCase: LoginUseCase,
        @inject(TYPES.GetPayloadUseCase) private getPayloadUseCase: GetPayloadUseCase,
        @inject(TYPES.RefreshTokenUseCase) private refreshTokenUseCase: RefreshTokenUseCase
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
}