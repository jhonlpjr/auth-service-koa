export class ValidationError extends Error {
    public errors: any;
    constructor(message: string, errors?: any) {
        super(message);
        this.name = ValidationError.name;
        this.errors = errors;
    }
}
