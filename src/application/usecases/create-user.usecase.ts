import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/providers/types";
import { UserRepository } from "../../domain/repository/user.repository";
import { Argon2PasswordHasher } from "../../infrastructure/crypto/argon-2-password-hasher";
import * as crypto from "crypto";
import { CreateUserDTO } from "../../api/dto/request/create-user.req.dto";

@injectable()
export class CreateUserUseCase {
    constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository
    ) {}

    async execute(dto: CreateUserDTO): Promise<any> {
        const passwordHasher = new Argon2PasswordHasher();
        const hashedPassword = await passwordHasher.hash(dto.password);
    // Generar clave secreta para el usuario
    const secretKey = crypto.randomBytes(32).toString('hex');
        const user = await this.userRepository.createUser({
            username: dto.username,
            email: dto.email,
            password: hashedPassword,
            key: secretKey
        });
        return { user, key: user.key };
    }
}
