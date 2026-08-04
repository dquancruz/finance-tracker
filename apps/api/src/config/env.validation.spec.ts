import { validate } from './env.validation';

const validBaseEnv = {
  MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/db',
  JWT_SECRET: 'a'.repeat(32),
};

describe('env.validation', () => {
  it('accepts a minimal valid development config and applies defaults', () => {
    const result = validate({ ...validBaseEnv });

    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3001);
    expect(result.THROTTLE_TTL_MS).toBe(60000);
    expect(result.THROTTLE_LIMIT).toBe(100);
  });

  it('rejects a malformed MONGODB_URI', () => {
    expect(() =>
      validate({ ...validBaseEnv, MONGODB_URI: 'not-a-mongo-uri' }),
    ).toThrow(/MONGODB_URI/);
  });

  it('rejects a JWT_SECRET shorter than 32 characters', () => {
    expect(() =>
      validate({ ...validBaseEnv, JWT_SECRET: 'too-short' }),
    ).toThrow(/JWT_SECRET/);
  });

  it('rejects production config with no CORS_ORIGIN set', () => {
    expect(() => validate({ ...validBaseEnv, NODE_ENV: 'production' })).toThrow(
      /CORS_ORIGIN must be explicitly set/,
    );
  });

  it('accepts production config when CORS_ORIGIN is set', () => {
    const result = validate({
      ...validBaseEnv,
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://app.example.com',
    });

    expect(result.NODE_ENV).toBe('production');
    expect(result.CORS_ORIGIN).toBe('https://app.example.com');
  });

  it('rejects an unrecognized NODE_ENV value', () => {
    expect(() =>
      validate({ ...validBaseEnv, NODE_ENV: 'staging-typo' }),
    ).toThrow();
  });
});
