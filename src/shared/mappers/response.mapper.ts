import { ErrorResponse } from "../api/responses/error-response";
import { OkResponse } from "../api/responses/ok-response";

export namespace ResponseMapper {
    export function okResponse<T>(data: T): OkResponse<T> {
        return {
            success: true,
            data
        };
    }

    export function errorResponse(error: any): ErrorResponse {
        // Si es una excepción HTTP tipada
        if (error && typeof error.statusCode === 'number') {
            return {
                success: false,
                message: error.message,
                code: error.statusCode,
                errors: error.details
            };
        }
        // Fallback para errores genéricos
        return {
            success: false,
            message: error?.message || 'Internal server error',
            code: 500,
            errors: error?.details || undefined
        };
    }
}

