export interface OkResponse<T> {
    success: true;
    data: T;
        code?: number; // Opcional, para que el middleware pueda setear el status
}