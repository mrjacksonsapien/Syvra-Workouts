import pg from 'pg';

// One shared pool: it keeps a few connections open and lends them to queries.
// Neon needs TLS; the URL contains `sslmode=require` there, and pg reads it from the URL.
export function createPool(databaseUrl: string): pg.Pool {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 5 });

  // An idle connection can be dropped (database restart, Neon suspending). pg reports that as an
  // 'error' event, and an unhandled one would crash the whole API. The pool discards the broken
  // connection itself, so we only log it.
  pool.on('error', (err) => {
    console.error('Unexpected database connection error:', err.message);
  });

  return pool;
}
