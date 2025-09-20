import { injectable, inject } from "inversify";
import { TYPES } from '../../../infrastructure/providers/types';
import { RevokeTokenDto } from "../../dto/revoke-token.dto";
import { RefreshTokenRepository } from "../../ports/repositories/refresh-token.repository";

@injectable()
export class RevokeTokenUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepository) private repo: RefreshTokenRepository
  ) {}

  async execute(input: RevokeTokenDto): Promise<void> {
    if (input.jti) {
      await this.repo.revoke(input.jti);
    } else if (input.userId) {
      await this.repo.revokeByUserId(input.userId);
    }
  }
}
