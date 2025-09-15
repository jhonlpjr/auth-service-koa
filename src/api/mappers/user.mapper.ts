import { User } from '../../domain/interfaces/user.interface';
import { UserLoggedResDTO } from '../dto/response/user-logged.res.dto';

export class UserMapper {
    static toUserLoggedResDTO(token: string, user: User): UserLoggedResDTO {
        return new UserLoggedResDTO(token, user);
    }

    static toUserResponse(user: User) {
        return {
            id: user.id,
            username: user.username,
            email: (user as any).email, // Si existe
            key: user.key,
            created_at: user.created_at,
        };
    }
}
