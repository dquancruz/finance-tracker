import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

const KNOWN_EXAMPLE_SECRETS = new Set(['change-me-to-a-random-32-char-string']);

/**
 * Startup env validation. Fails fast (throws before Nest finishes
 * bootstrapping) instead of letting a misconfigured deploy start with a
 * missing secret, an unset production CORS origin, or a malformed Mongo URI.
 */
class EnvironmentVariables {
  // Numeric fields below MUST have an explicit `: number` annotation. With
  // `isolatedModules` on, tsc can't infer a per-file type for a bare
  // `= 3001` initializer, so `emitDecoratorMetadata` emits `design:type:
  // Object` instead of `Number` — and class-transformer's
  // `enableImplicitConversion` relies on that metadata to coerce the raw
  // (always-a-string) process.env value. Without the annotation, PORT etc.
  // stay strings and fail @IsInt()/@Min() on every real deploy.
  @IsOptional()
  @IsIn(Object.values(Environment))
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  @Matches(/^mongodb(\+srv)?:\/\//, {
    message:
      'MONGODB_URI must be a valid mongodb:// or mongodb+srv:// connection string',
  })
  MONGODB_URI: string;

  @IsString()
  @MinLength(32, {
    message: 'JWT_SECRET must be at least 32 characters long',
  })
  JWT_SECRET: string;

  /** OAuth audience used to verify Google ID tokens from the web app. */
  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  PORT: number = 3001;

  /** Comma-separated allowed CORS origins. Required when NODE_ENV=production. */
  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsOptional()
  @IsInt()
  @Min(1000)
  THROTTLE_TTL_MS: number = 60000;

  @IsOptional()
  @IsInt()
  @Min(1)
  THROTTLE_LIMIT: number = 100;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('\n')}`,
    );
  }

  if (
    validatedConfig.NODE_ENV === Environment.Production &&
    !validatedConfig.CORS_ORIGIN
  ) {
    throw new Error(
      'CORS_ORIGIN must be explicitly set when NODE_ENV=production (no wildcard fallback in production)',
    );
  }

  if (
    validatedConfig.NODE_ENV === Environment.Production &&
    KNOWN_EXAMPLE_SECRETS.has(validatedConfig.JWT_SECRET)
  ) {
    throw new Error(
      'JWT_SECRET must not use the documented example value in production',
    );
  }

  return validatedConfig;
}
