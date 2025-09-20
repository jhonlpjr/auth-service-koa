import { MfaController } from '../../../src/api/controllers/mfa.controller';

import { container } from '../../../src/infrastructure/providers/container-config';
import { TYPES } from '../../../src/infrastructure/providers/types';
import { ResponseMapper } from '../../../src/shared/mappers/response.mapper';
import { MfaMapper } from '../../../src/api/mappers/mfa.mapper';
import { validateDto } from '../../../src/shared/utils/validators';

jest.mock('../../../src/infrastructure/providers/container-config', () => ({
    container: { get: jest.fn() }
}));
jest.mock('../../../src/shared/utils/validators', () => ({
    validateDto: jest.fn()
}));
jest.mock('../../../src/api/mappers/mfa.mapper', () => ({
    MfaMapper: {
        toTotpSetupResponse: jest.fn(),
        toFactorResponse: jest.fn(),
        toSetupTotpReqDTO: jest.fn()
    }
}));
jest.mock('../../../src/shared/mappers/response.mapper', () => ({
    ResponseMapper: {
        okResponse: jest.fn()
    }
}));

describe('MfaController', () => {
    let controller: MfaController;
    let ctx: any;
    let setupTotp: any;
    let activateTotp: any;
    let verifyTotp: any;
    let verifyRecovery: any;
    let listFactors: any;
    let issueTokens: any;

    beforeEach(() => {
        controller = new MfaController();
        ctx = {
            request: { body: {} },
            body: undefined,
            state: { user: { id: 'user1', username: 'testuser', email: 'test@example.com' } },
        };
        setupTotp = { execute: jest.fn() };
        activateTotp = { execute: jest.fn() };
        verifyTotp = { execute: jest.fn() };
        verifyRecovery = { execute: jest.fn() };
        listFactors = { execute: jest.fn() };
        issueTokens = { execute: jest.fn() };
        (container.get as jest.Mock).mockImplementation((type) => {
            if (type === TYPES.SetupTotpUseCase) return setupTotp;
            if (type === TYPES.ActivateTotpUseCase) return activateTotp;
            if (type === TYPES.VerifyTotpUseCase) return verifyTotp;
            if (type === TYPES.VerifyRecoveryCodeUseCase) return verifyRecovery;
            if (type === TYPES.ListFactorsUseCase) return listFactors;
            if (type === TYPES.IssueTokensForUserIdUseCase) return issueTokens;
            return undefined;
        });
        (validateDto as jest.Mock).mockResolvedValue(undefined);
    });

    it('setupTotp: debe ejecutar el caso de uso y mapear la respuesta', async () => {
        setupTotp.execute.mockResolvedValue('otpauth://url');
        (MfaMapper.toTotpSetupResponse as jest.Mock).mockReturnValue({ url: 'otpauth://url' });
        (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
        await controller.setupTotp(ctx);
        expect(setupTotp.execute).toHaveBeenCalled();
        expect(ctx.body).toEqual({ ok: true });
    });

    it('activateTotp: debe ejecutar el caso de uso y devolver activado', async () => {
        activateTotp.execute.mockResolvedValue(undefined);
        (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ activated: true });
        ctx.request.body = { token: '123456' };
        await controller.activateTotp(ctx);
        expect(activateTotp.execute).toHaveBeenCalledWith('user1', '123456');
        expect(ctx.body).toEqual({ activated: true });
    });

    it('verifyTotp: debe ejecutar el caso de uso y emitir tokens', async () => {
        verifyTotp.execute.mockResolvedValue(undefined);
        issueTokens.execute.mockResolvedValue({ accessToken: 'jwt', refreshToken: 'r', userId: 'user1' });
        (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
        ctx.request.body = { token: '654321' };
        await controller.verifyTotp(ctx);
        expect(verifyTotp.execute).toHaveBeenCalledWith('user1', '654321');
        expect(issueTokens.execute).toHaveBeenCalledWith('user1');
        expect(ctx.body).toEqual({ ok: true });
    });

    it('verifyRecovery: debe ejecutar el caso de uso y emitir tokens', async () => {
        verifyRecovery.execute.mockResolvedValue(undefined);
        issueTokens.execute.mockResolvedValue({ accessToken: 'jwt', refreshToken: 'r', userId: 'user1' });
        (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
        ctx.request.body = { code: 'recovery' };
        await controller.verifyRecovery(ctx);
        expect(verifyRecovery.execute).toHaveBeenCalledWith('user1', 'recovery');
        expect(issueTokens.execute).toHaveBeenCalledWith('user1');
        expect(ctx.body).toEqual({ ok: true });
    });

    it('listFactors: debe ejecutar el caso de uso y mapear la respuesta', async () => {
        listFactors.execute.mockResolvedValue([{ id: 1, type: 'totp', status: 'active' }]);
        (MfaMapper.toFactorResponse as jest.Mock).mockReturnValue({ id: 1, type: 'totp', status: 'active' });
        (ResponseMapper.okResponse as jest.Mock).mockReturnValue({ ok: true });
        await controller.listFactors(ctx);
        expect(listFactors.execute).toHaveBeenCalledWith('user1');
        expect(ctx.body).toEqual({ ok: true });
    });
});
