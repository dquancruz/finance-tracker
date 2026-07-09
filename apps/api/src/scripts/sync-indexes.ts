import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { AppModule } from '../app.module';

/**
 * One-off maintenance script: explicitly (re)builds every Mongoose index
 * from the current schema definitions.
 *
 * `AppModule`'s Mongoose connection sets `autoIndex: false` in production
 * (see `app.module.ts`) — index builds acquire a write lock and can be slow
 * on a large collection, so we don't want Nest silently attempting them on
 * every cold start of a production instance. Instead, run this script
 * explicitly:
 *   - once, after this deploy, to create the new indexes (e.g. the
 *     unique `(userId, dedupeKey)` notification index)
 *   - again any time a schema's indexes change
 *
 * Usage:
 *   MONGODB_URI=... JWT_SECRET=... npx ts-node -r tsconfig-paths/register src/scripts/sync-indexes.ts
 *   (or, after `npm run build`): node dist/scripts/sync-indexes.js
 */
async function main() {
  const logger = new Logger('SyncIndexes');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const connection = app.get<Connection>(getConnectionToken());
    const modelNames = connection.modelNames();

    logger.log(`Syncing indexes for ${modelNames.length} model(s)...`);
    for (const name of modelNames) {
      // Sequential on purpose — avoids concurrent index builds contending
      // for the same collection's write lock.
      const result = await connection.model(name).syncIndexes();
      logger.log(
        `  ${name}: ${result.length === 0 ? 'no changes' : result.join(', ')}`,
      );
    }
    logger.log('Index sync complete.');
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error('sync-indexes failed:', error);
  process.exitCode = 1;
});
