import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security headers (CSP, HSTS, X-Frame-Options, etc.). `crossOriginResourcePolicy`
  // relaxed to same-site since the Next.js frontend and Socket.IO client run
  // on a different origin in dev/staging.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const isProduction = config.get<string>('NODE_ENV') === 'production';
  const allowedOrigins = (config.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // env.validation.ts guarantees CORS_ORIGIN is set when NODE_ENV=production,
  // so `allowedOrigins` is only ever empty here in non-production environments.
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : !isProduction,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = config.get<number>('PORT') ?? 3001;
  await app.listen(port);
  logger.log(
    `API listening on port ${port} (NODE_ENV=${config.get<string>('NODE_ENV')})`,
  );
}

void bootstrap();
