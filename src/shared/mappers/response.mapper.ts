import { ErrorResponse } from "../api/responses/error-response";
import { OkResponse } from "../api/responses/ok-response";
import { HttpStatus } from "../enums/http-status.enum";

export namespace ResponseMapper {
    export function okResponse<T>(data: T): OkResponse<T> {
            return {
                success: true,
                data,
                code: HttpStatus.OK
            };
    }

    export function createdResponse<T>(data: T): OkResponse<T> {
        // Semánticamente igual a okResponse, pero para 201 Created
            return {
                success: true,
                data,
                code: HttpStatus.CREATED
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
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            errors: error?.details || undefined
        };
    }
}

