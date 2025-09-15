import { Container } from 'inversify';
import { TYPES } from './types';
import { LoginUseCase } from '../../application/usecases/login.usecase';
import { AuthService } from '../../application/service/auth.service';
import { AuthRepository } from '../../domain/repository/auth.repository';
import { AuthRepositoryImpl } from '../database/repositories/auth.postgres.repository';
import { UserRepositoryImpl } from '../database/repositories/user.postgres.repository';
import { SuperUserController } from '../../api/controllers/super-user.controller';
import { AuthController } from '../../api/controllers/auth.controller';
import { GetPayloadUseCase } from '../../application/usecases/get-payload.usecase';
import { CreateUserUseCase } from '../../application/usecases/create-user.usecase';

const container = new Container();

container.bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);
container.bind<GetPayloadUseCase>(TYPES.GetPayloadUseCase).to(GetPayloadUseCase);
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<AuthRepository>(TYPES.AuthRepository).to(AuthRepositoryImpl);
container.bind(TYPES.UserRepository).to(UserRepositoryImpl);
container.bind<CreateUserUseCase>(TYPES.CreateUserUseCase).to(CreateUserUseCase);
container.bind<SuperUserController>(TYPES.SuperUserController).to(SuperUserController);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);

export { container };