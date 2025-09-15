export class ValidateTransactionResponseDto {
  isValid: boolean;
  message: string;

  constructor(isValid: boolean, message: string) {
    this.isValid = isValid;
    this.message = message;
  }
}
