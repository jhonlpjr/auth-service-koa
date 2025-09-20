export const TYPES = {

  UserRepository: Symbol.for('UserRepository'),
  RefreshTokenRepository: Symbol.for('RefreshTokenRepository'),
  MfaFactorsRepository: Symbol.for('MfaFactorsRepository'),
  RecoveryCodesRepository: Symbol.for('RecoveryCodesRepository'),
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  LoginUseCase: Symbol.for('LoginUseCase'),
  GetPayloadUseCase: Symbol.for('GetPayloadUseCase'),
  VerificateSecretKeyUseCase: Symbol.for('VerificateSecretKeyUseCase'),
  RefreshTokenUseCase: Symbol.for('RefreshTokenUseCase'),
  RevokeTokenUseCase: Symbol.for('RevokeTokenUseCase'),
  SetupTotpUseCase: Symbol.for('SetupTotpUseCase'),
  ActivateTotpUseCase: Symbol.for('ActivateTotpUseCase'),
  VerifyTotpUseCase: Symbol.for('VerifyTotpUseCase'),
  ListFactorsUseCase: Symbol.for('ListFactorsUseCase'),
  VerifyRecoveryCodeUseCase: Symbol.for('VerifyRecoveryCodeUseCase'),
  NeedsMfaUseCase: Symbol.for('NeedsMfaUseCase'),
  IssueTokensForUserIdUseCase: Symbol.for('IssueTokensForUserIdUseCase'),
  SuperUserController: Symbol.for('SuperUserController'),
  AuthController: Symbol.for('AuthController'),
  PasswordHasher: Symbol.for('PasswordHasher'),

};