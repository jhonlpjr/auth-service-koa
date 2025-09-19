import { LoginResDTO } from "../dto/response/login.res.dto";

export namespace AuthMapper {
    export function toLoginResponse(
        accessToken: string,
        refreshToken: string,
        expiresIn: number,
        tokenType: string,
        userId: string,
        scope?: string,
        aud?: string
    ) {
        return new LoginResDTO(accessToken, refreshToken, expiresIn, tokenType, userId, scope, aud);
    }

    export function toMfaLoginResponse(loginTx: string, mfaTypes: string[]) {
        return {
            step: 'mfa',
            login_tx: loginTx,
            mfa: { types: mfaTypes }
        };
    }

    export function toRevokeResponse(success: boolean) {
        return { revoked: success };
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