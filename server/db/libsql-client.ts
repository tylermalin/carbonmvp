import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error('TURSO_DATABASE_URL environment variable is not set');
}

// Create the libsql client
export const db = createClient({
  url,
  authToken: authToken || undefined,
});

// Initialize database schema
export async function initializeDatabase() {
  try {
    // Read and execute schema
    const fs = await import('fs/promises');
    const path = await import('path');
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');
    
    // Remove comments and split by semicolons that are NOT inside parentheses
    // This is a simple approach - for production, consider a proper SQL parser
    const lines = schema.split('\n');
    let currentStatement = '';
    const statements: string[] = [];
    let parenDepth = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip comment lines
      if (trimmedLine.startsWith('--')) {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Count parentheses to detect statement boundaries
      for (const char of line) {
        if (char === '(') parenDepth++;
        if (char === ')') parenDepth--;
        if (char === ';' && parenDepth === 0) {
          // This semicolon ends a complete statement
          const stmt = currentStatement.trim();
          if (stmt.length > 0) {
            statements.push(stmt);
          }
          currentStatement = '';
          parenDepth = 0;
        }
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }
    
    // Separate CREATE TABLE and CREATE INDEX statements
    const tableStatements: string[] = [];
    const indexStatements: string[] = [];
    
    for (const statement of statements) {
      const upper = statement.toUpperCase().trim();
      if (upper.startsWith('CREATE TABLE')) {
        tableStatements.push(statement);
      } else if (upper.startsWith('CREATE INDEX')) {
        indexStatements.push(statement);
      }
    }
    
    // First, create all tables
    for (const statement of tableStatements) {
      try {
        await db.execute(statement);
        const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1];
        if (tableName) {
          console.log(`✅ Created table: ${tableName}`);
        }
      } catch (err: any) {
        // Ignore "table already exists" errors
        if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          continue;
        }
        console.error(`❌ Error creating table: ${statement.substring(0, 100)}`, err.message);
        throw err;
      }
    }
    
    // Then, create all indexes
    for (const statement of indexStatements) {
      try {
        await db.execute(statement);
      } catch (err: any) {
        // Ignore "index already exists" errors
        if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          continue;
        }
        // Log but don't fail on index errors - they're not critical
        console.warn(`⚠️  Warning creating index: ${err.message}`);
      }
    }
    
    console.log('✅ Database schema initialized successfully');
  } catch (error: any) {
    console.error('❌ Error initializing database:', error.message || error);
    // Don't throw - schema might already exist or be partially created
  }
}

