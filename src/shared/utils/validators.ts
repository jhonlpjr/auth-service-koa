import { validate } from 'class-validator';
import { BadRequestError } from '../api/exceptions/bad-request-error';

export async function validateDto(dto: object) {
    const errors = await validate(dto);
    if (errors.length > 0) {
        throw new BadRequestError('Validation failed', errors.map(error => error.constraints));
    }
}
