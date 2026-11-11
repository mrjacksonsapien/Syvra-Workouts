import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { createPool } from './db/pool.js';

const env = loadEnv();
const pool = createPool(env.DATABASE_URL);
const app = createApp({ pool, corsOrigin: env.CORS_ORIGIN });

// listen() opens the port and starts accepting HTTP requests.
const server = app.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT}`);
});

// Render sends SIGTERM when it restarts the service: stop accepting requests, then close the DB.
process.on('SIGTERM', () => {
  server.close(() => {
    void pool.end();
  });
});
