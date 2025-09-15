import { Context } from "koa";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infraestructure/providers/types";
import { CreateUserUseCase } from "../../application/usecases/create-user.usecase";
import { CreateUserDTO } from "../dto/request/create-user.req.dto";
import { validateDto } from "../../shared/utils/validators";
import { UserMapper } from "../mappers/user.mapper";


@injectable()
export class SuperUserController {
    constructor(
        @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase
    ) { }

    async createUser(ctx: Context) {
        const { username, password, email } = ctx.request.body as any;
        const requestDto = new CreateUserDTO(username, email, password);
        await validateDto(requestDto); // Lanza excepción si falla
        const result = await this.createUserUseCase.execute(requestDto);
        ctx.body = {
            user: UserMapper.toUserResponse(result.user),
            key: result.key
        };
    }
}
