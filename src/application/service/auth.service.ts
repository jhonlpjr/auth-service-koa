import { inject } from "inversify";
import { LoginUseCase } from "../usecases/login.usecase";
import { TYPES } from "../../infraestructure/providers/types";
import logger from "../../utils/logger";
import { LoginReqDTO } from '../../presentation/http/dto/request/login.req.dto';
// import eliminado: VerificateSecretKeyUseCase
import { GetPayloadUseCase } from "../usecases/get-payload.usecase";
import { injectable } from "inversify";

@injectable()
export class AuthService {
    constructor(
        @inject(TYPES.LoginUseCase) private loginUseCase: LoginUseCase,
        @inject(TYPES.GetPayloadUseCase) private getPayloadUseCase: GetPayloadUseCase,
    // verificateSecretKeyUseCase eliminado
    ) { }

    public async login(dto: LoginReqDTO): Promise<any> {
        try {
            const result = await this.loginUseCase.execute(dto.username, dto.password);
            return result;
        } catch (error) {
            logger.error(`Login failed: ${error}`);
            throw error;
        }

    }

    public async getPayload(token: string): Promise<any> {
        try {
            const result = await this.getPayloadUseCase.execute(token);
            return result;
        } catch (error) {
            logger.error(`Error getting payload: ${error}`);
            throw error;
        }
    }

    // método validateSecretKey eliminado
}