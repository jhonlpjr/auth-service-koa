import { LoginResDTO } from "../dto/response/login.res.dto";

export namespace AuthMapper {
    export function toLoginResponse(token: string, refreshToken: string) {
        return new LoginResDTO(token, refreshToken);
    }

    export function toPayloadResponse(payload: any) {
        // Puedes adaptar según la estructura real del payload
        return {
            id: payload.id,
            username: payload.username,
            key: payload.key
        };
    }
}