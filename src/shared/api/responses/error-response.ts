export interface ErrorResponse {
    success: false;
    message: string;
    code?: number;
    errors?: any;
}