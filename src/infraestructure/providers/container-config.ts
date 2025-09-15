import { Container } from 'inversify';
import { TYPES } from './types';
import { LoginUseCase } from '../../application/usecases/login.usecase';
import { AuthService } from '../../application/service/auth.service';
import { UserRepositoryImpl } from '../database/repositories/user.postgres.repository';
import { RefreshTokenUseCase } from '../../application/usecases/refresh-token.usecase';
import { AuthController } from '../../api/controllers/auth.controller';
import { SuperUserController } from '../../api/controllers/super-user.controller';
import { CreateUserUseCase } from '../../application/usecases/create-user.usecase';
import { GetPayloadUseCase } from '../../application/usecases/get-payload.usecase';
import { RefreshTokenRepositoryImpl } from '../database/repositories/refresh-token.postgres.repository';

const container = new Container();

container.bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);
container.bind<CreateUserUseCase>(TYPES.CreateUserUseCase).to(CreateUserUseCase);
container.bind<GetPayloadUseCase>(TYPES.GetPayloadUseCase).to(GetPayloadUseCase);
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind(TYPES.UserRepository).to(UserRepositoryImpl);
container.bind(TYPES.RefreshTokenRepository).to(RefreshTokenRepositoryImpl);
container.bind<RefreshTokenUseCase>(TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<SuperUserController>(TYPES.SuperUserController).to(SuperUserController);

export { container };