import { HttpStatus } from "../enums/http-status.enum";


export class TooManyRequestsError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message = 'Too Many Requests', details?: any) {
    super(message);
    this.name = 'TooManyRequestsError';
    this.statusCode = HttpStatus.TOO_MANY_REQUESTS;
    this.details = details;
  }
}
