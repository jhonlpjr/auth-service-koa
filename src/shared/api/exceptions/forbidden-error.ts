import { HttpStatus } from "../../enums/http-status.enum";

export class ForbiddenError extends Error {
    public statusCode: number;
    public details?: any;
    constructor(message: string, details?: any) {
        super(message);
        this.name = ForbiddenError.name;
        this.statusCode = HttpStatus.FORBIDDEN;
        this.details = details;
    }
}
