import { HttpStatus } from "../enums/http-status.enum";

export class DatabaseError extends Error {
    public statusCode: number;
    public details?: any;
    constructor(details?: any) {
        super('Database error');
        this.name = DatabaseError.name;
        this.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        this.details = details;
    }
}
