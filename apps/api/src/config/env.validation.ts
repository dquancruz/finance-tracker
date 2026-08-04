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

/**
 * Startup env validation. Fails fast (throws before Nest finishes
 * bootstrapping) instead of letting a misconfigured deploy start with a
 * missing secret, an unset production CORS origin, or a malformed Mongo URI.
 */
class EnvironmentVariables {
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

  @IsOptional()
  @IsInt()
  @Min(1)
  PORT = 3001;

  /** Comma-separated allowed CORS origins. Required when NODE_ENV=production. */
  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsOptional()
  @IsInt()
  @Min(1000)
  THROTTLE_TTL_MS = 60000;

  @IsOptional()
  @IsInt()
  @Min(1)
  THROTTLE_LIMIT = 100;
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

  return validatedConfig;
}
