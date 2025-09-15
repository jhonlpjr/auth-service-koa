import { validate } from 'class-validator';

export class ValidationError extends Error {
    public errors: any;
    constructor(message: string, errors?: any) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

export async function validateDto(dto: object) {
    const errors = await validate(dto);
    if (errors.length > 0) {
        throw new ValidationError('Validation failed', errors.map(error => error.constraints));
    }
}
