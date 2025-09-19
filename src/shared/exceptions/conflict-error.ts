import { HttpStatus } from "../enums/http-status.enum";

export class ConflictError extends Error {
    public statusCode: number;
    public details?: any;
    constructor(message: string, details?: any) {
        super(message);
        this.name = ConflictError.name;
        this.statusCode = HttpStatus.CONFLICT;
        this.details = details;
    }
}
