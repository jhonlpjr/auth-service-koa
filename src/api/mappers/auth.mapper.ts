import { LoginResDTO } from "../dto/response/login.res.dto";

export namespace AuthMapper {
    export function toLoginResponse(accessToken: string, refreshToken: string) {
        return new LoginResDTO(accessToken, refreshToken);
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