/**
 * Reset database script - drops all tables and recreates them
 * Use this if you need to start fresh with the schema
 */

import { db } from '../server/db/libsql-client';

async function resetDatabase() {
  try {
    console.log('🗑️  Dropping existing tables...');
    
    // Drop tables in reverse order of dependencies
    const dropStatements = [
      'DROP TABLE IF EXISTS credits',
      'DROP TABLE IF EXISTS sensors',
      'DROP TABLE IF EXISTS projects',
      'DROP TABLE IF EXISTS users',
      'DROP TABLE IF EXISTS organizations',
    ];

    for (const statement of dropStatements) {
      try {
        await db.execute(statement);
        console.log(`✅ Dropped: ${statement}`);
      } catch (error: any) {
        console.warn(`⚠️  Could not drop: ${statement}`, error.message);
      }
    }

    console.log('✅ All tables dropped');
    console.log('🔄 Now run: npm run init-db');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase().then(() => {
  process.exit(0);
});

