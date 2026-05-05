import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { closeDbPool } from '../config/db';
import { query } from '../utils/db';

async function run(): Promise<void> {
  const sqlPath = resolve(process.cwd(), 'db', 'init.sql');
  const initSql = await readFile(sqlPath, 'utf8');

  await query(initSql);
  const pingResult = await query<{ ok: number }>('SELECT 1 AS ok');
  console.log('DB ping:', pingResult.rows[0]?.ok === 1 ? 'ok' : 'failed');

  const tablesResult = await query<{ table_name: string }>(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'watchlists', 'price_history', 'audit_logs')
      ORDER BY table_name;
    `,
  );

  console.log('Tables:', tablesResult.rows.map((row) => row.table_name).join(', '));

  const hypertableResult = await query<{ is_hypertable: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM timescaledb_information.hypertables
        WHERE hypertable_schema = 'public'
          AND hypertable_name = 'price_history'
      ) AS is_hypertable;
    `,
  );

  console.log(
    'Hypertable price_history:',
    hypertableResult.rows[0]?.is_hypertable ? 'ok' : 'not_found',
  );
}

run()
  .catch((error: unknown) => {
    console.error('Database verification failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDbPool();
  });
