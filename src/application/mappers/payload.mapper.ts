import { PayloadDTO } from "../dto/payload.dto";
import { UnauthorizedError } from "../../shared/exceptions/unauthorized-error";

export namespace PayloadMapper {
    export function mapToPayloadResDTO(payload: Record<string, any>): PayloadDTO {
        if (!payload || typeof payload !== 'object') {
            throw new UnauthorizedError('Invalid token payload');
        }
        if (!payload.id || typeof payload.id !== 'string') {
            throw new UnauthorizedError('Invalid token payload: missing id');
        }
        if (!payload.username || typeof payload.username !== 'string') {
            throw new UnauthorizedError('Invalid token payload: missing username');
        }
        if (!payload.key || typeof payload.key !== 'string') {
            throw new UnauthorizedError('Invalid token payload: missing key');
        }
        return new PayloadDTO(payload.id, payload.username, payload.key);
    }
}