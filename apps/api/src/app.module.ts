import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { validate } from './config/env.validation';
import { ExpensesModule } from './expenses/expenses.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './realtime/realtime.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        // Production-safe connection defaults for MongoDB Atlas: retry
        // transient writes/reads (Atlas performs rolling maintenance and
        // failovers), keep a bounded pool so the API doesn't exhaust Atlas
        // connection limits under load, and fail fast instead of hanging
        // indefinitely if the cluster is unreachable at boot.
        retryWrites: true,
        retryReads: true,
        maxPoolSize: config.get<string>('NODE_ENV') === 'production' ? 20 : 10,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 10000,
        autoIndex: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: config.get<number>('THROTTLE_TTL_MS', 60000),
            limit: config.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    ExpensesModule,
    AnalyticsModule,
    RealtimeModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limiting guard — every route is throttled by default;
    // override per-route with @Throttle()/@SkipThrottle() (see AuthController
    // for stricter limits on login/register).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
