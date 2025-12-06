/**
 * Database initialization script
 * Run this manually if you need to initialize the database schema separately
 */

import { db, initializeDatabase } from '../server/db/libsql-client';

async function main() {
  console.log('Initializing database schema...');
  await initializeDatabase();
  console.log('Done!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

