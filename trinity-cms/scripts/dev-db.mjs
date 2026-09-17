// Local-only Postgres for development. Production uses Vercel/Neon Postgres via DATABASE_URL.
import EmbeddedPostgres from 'embedded-postgres';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.resolve('.pgdata');
const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'trinity',
  password: 'trinity',
  port: 5433,
  persistent: true,
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
});

const fresh = !fs.existsSync(path.join(dataDir, 'PG_VERSION'));
if (fresh) await pg.initialise();
await pg.start();
if (fresh) await pg.createDatabase('trinity_cms');
console.log('postgres ready: postgresql://trinity:trinity@localhost:5433/trinity_cms');

const stop = async () => { await pg.stop(); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
