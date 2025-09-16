import { Environment } from "../../../src/infrastructure/config/environment.config";


describe('Environment', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should return the value of an existing env var', () => {
    process.env.TEST_KEY = 'value';
    expect(Environment.get('TEST_KEY')).toBe('value');
  });

  it('should throw if env var is missing', () => {
    delete process.env.TEST_KEY;
    expect(() => Environment.get('TEST_KEY')).toThrow('[Environment] Missing required environment variable: TEST_KEY');
  });

  it('should throw if env var is empty', () => {
    process.env.TEST_KEY = '   ';
    expect(() => Environment.get('TEST_KEY')).toThrow('[Environment] Missing required environment variable: TEST_KEY');
  });
});
