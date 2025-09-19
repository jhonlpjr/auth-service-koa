import { HttpStatus } from "../enums/http-status.enum";

export class InternalServerError extends Error {
    public statusCode: number;
    public details?: any;
    constructor(message: string = 'Internal server error', details?: any) {
        super(message);
        this.name = InternalServerError.name;
        this.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        this.details = details;
    }
}
