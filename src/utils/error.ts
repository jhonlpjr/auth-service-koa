export const ERROR_INTERNAL_SERVER = "Internal server error";
export const ERROR_BAD_REQUEST = "Bad request";

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}