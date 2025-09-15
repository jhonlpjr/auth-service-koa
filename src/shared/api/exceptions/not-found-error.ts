import { HttpStatus } from "../../enums/http-status.enum";

export class NotFoundError extends Error {
    public statusCode: number;
    public details?: any;
    constructor(message: string, details?: any) {
        super(message);
        this.name = NotFoundError.name;
        this.statusCode = HttpStatus.NOT_FOUND;
        this.details = details;
    }
}
