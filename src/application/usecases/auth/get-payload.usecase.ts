import { injectable } from "inversify";
import logger from "../../../shared/utils/logger";

import { PayloadMapper } from "../../mappers/payload.mapper";
import { TokenUtils } from "../../../shared/utils/token.utils";
import { GETTING_PAYLOAD_FAILED_DETAILS, UNKNOWN_ERROR } from "../../../shared/constants/errors.constants";

@injectable()
export class GetPayloadUseCase {
  constructor() { }

  async execute(token: string) {
    try {
  const payload = TokenUtils.verifyJwtToken(token);
  return PayloadMapper.mapToPayloadResDTO(payload);

    } catch (error: any) {
      if (error instanceof Error) {
        logger.error(GETTING_PAYLOAD_FAILED_DETAILS.concat(error.message));
        throw error;
      } else {
        logger.error(UNKNOWN_ERROR);
        throw new Error(UNKNOWN_ERROR);
      }
    }
  }
}
