import { HttpStatus } from "../enums/http-status.enum";

export class BadRequestError extends Error {
    public statusCode: number;
    public details?: any;
    constructor(message: string, details?: any) {
        super(message);
        this.name = BadRequestError.name;
        this.statusCode = HttpStatus.BAD_REQUEST;
        this.details = details;
    }
}
