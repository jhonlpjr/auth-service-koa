import { HttpStatus } from "../../enums/http-status.enum";

export class UnauthorizedError extends Error {
    public statusCode: number;
    public details?: any;
    constructor(details?: any) {
        super("Unauthorized");
        this.name = UnauthorizedError.name;
        this.statusCode = HttpStatus.UNAUTHORIZED;
        this.details = details;
    }
}