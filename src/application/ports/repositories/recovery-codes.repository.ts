export interface RecoveryCodesRepository {
  generateCodes(userId: string, count?: number): Promise<string[]>; // retorna enmascarados
  verifyCode(userId: string, code: string): Promise<{ ok: boolean; codeId?: string }>;
  markUsed(codeId: string): Promise<void>;
}
