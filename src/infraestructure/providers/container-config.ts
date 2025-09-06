import { Container } from 'inversify';
import { TYPES } from './types';
import { LoginUseCase } from '../../application/usecases/login.usecase';
import { AuthService } from '../../application/service/auth.service';
import { AuthRepository } from '../../domain/repository/auth.repository';
import { AuthRepositoryImpl } from '../database/repositories/auth.postgres.repository';
import { GetPayloadUseCase } from '../../application/usecases/get-payload.usecase';
import { VerificateSecretKeyUseCase } from '../../application/usecases/verificate-secret-key.usecase';

const container = new Container();

container.bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);
container.bind<GetPayloadUseCase>(TYPES.GetPayloadUseCase).to(GetPayloadUseCase);
container.bind<VerificateSecretKeyUseCase>(TYPES.VerificateSecretKeyUseCase).to(VerificateSecretKeyUseCase);
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<AuthRepository>(TYPES.AuthRepository).to(AuthRepositoryImpl);

export { container };