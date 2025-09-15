import { Context } from "koa";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infraestructure/providers/types";
import { CreateUserUseCase } from "../../application/usecases/create-user.usecase";

@injectable()
export class SuperUserController {
    constructor(
        @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase
    ) {}

    async createUser(ctx: Context) {
        const { username, password, email } = ctx.request.body as any;
        if (!username || !password || !email) {
            ctx.status = 400;
            ctx.body = { error: "Missing required fields" };
            return;
        }
        const result = await this.createUserUseCase.execute({ username, email, password });
        ctx.status = 201;
        ctx.body = { user: result.user, key: result.key };
    }
}
