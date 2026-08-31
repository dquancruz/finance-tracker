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

  it('rejects the documented example JWT secret in production', () => {
    expect(() =>
      validate({
        ...validBaseEnv,
        NODE_ENV: 'production',
        CORS_ORIGIN: 'https://app.example.com',
        JWT_SECRET: 'change-me-to-a-random-32-char-string',
      }),
    ).toThrow(/example value/);
  });

  it('rejects an unrecognized NODE_ENV value', () => {
    expect(() =>
      validate({ ...validBaseEnv, NODE_ENV: 'staging-typo' }),
    ).toThrow();
  });

  // Regression test: process.env values are always strings — plain object
  // literals with real numbers (as in the other tests) don't exercise the
  // string->number coercion path that class-transformer's
  // enableImplicitConversion depends on. This is what broke PORT on every
  // real deploy despite passing tests.
  it('coerces string-typed numeric env vars (as process.env actually provides them)', () => {
    const result = validate({
      ...validBaseEnv,
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://app.example.com',
      PORT: '3000',
      THROTTLE_TTL_MS: '30000',
      THROTTLE_LIMIT: '50',
    });

    expect(result.PORT).toBe(3000);
    expect(result.THROTTLE_TTL_MS).toBe(30000);
    expect(result.THROTTLE_LIMIT).toBe(50);
  });

  it('rejects a non-numeric string PORT', () => {
    expect(() => validate({ ...validBaseEnv, PORT: 'not-a-port' })).toThrow(
      /PORT/,
    );
  });

  it('accepts optional admin bootstrap env vars when both are set', () => {
    const result = validate({
      ...validBaseEnv,
      ADMIN_EMAIL: 'admin@example.com',
      ADMIN_PASSWORD: 'password12',
      ADMIN_NAME: 'Admin',
    });

    expect(result.ADMIN_EMAIL).toBe('admin@example.com');
    expect(result.ADMIN_PASSWORD).toBe('password12');
    expect(result.ADMIN_NAME).toBe('Admin');
  });

  it('rejects admin bootstrap env vars when only one is set', () => {
    expect(() =>
      validate({ ...validBaseEnv, ADMIN_EMAIL: 'admin@example.com' }),
    ).toThrow(/ADMIN_PASSWORD is required/);

    expect(() =>
      validate({ ...validBaseEnv, ADMIN_PASSWORD: 'password12' }),
    ).toThrow(/ADMIN_EMAIL is required/);
  });
});
