/**
 * Migration script to add completion status columns to projects table
 * and activation status to sensors table
 * 
 * Run this after updating the schema.sql file:
 * npm run migrate-completion-status
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const dbUrl = process.env.TURSO_DATABASE_URL;
const dbAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || !dbAuthToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local');
  process.exit(1);
}

const db = createClient({
  url: dbUrl,
  authToken: dbAuthToken,
});

async function migrate() {
  try {
    console.log('Starting migration...');

    // Add pdd_completion_status column if it doesn't exist
    try {
      await db.execute(`
        ALTER TABLE projects 
        ADD COLUMN pdd_completion_status TEXT DEFAULT 'NOT_COMPLETE'
      `);
      console.log('✓ Added pdd_completion_status column');
    } catch (error: any) {
      if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
        console.log('  pdd_completion_status column already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Add sensor_activation_status column if it doesn't exist
    try {
      await db.execute(`
        ALTER TABLE projects 
        ADD COLUMN sensor_activation_status TEXT DEFAULT 'PENDING'
      `);
      console.log('✓ Added sensor_activation_status column');
    } catch (error: any) {
      if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
        console.log('  sensor_activation_status column already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Add sensor activation fields if they don't exist
    try {
      await db.execute(`
        ALTER TABLE sensors 
        ADD COLUMN activation_status TEXT DEFAULT 'PENDING'
      `);
      console.log('✓ Added activation_status column to sensors');
    } catch (error: any) {
      if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
        console.log('  activation_status column already exists, skipping...');
      } else {
        throw error;
      }
    }

    try {
      await db.execute(`
        ALTER TABLE sensors 
        ADD COLUMN geolocation TEXT
      `);
      console.log('✓ Added geolocation column to sensors');
    } catch (error: any) {
      if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
        console.log('  geolocation column already exists, skipping...');
      } else {
        throw error;
      }
    }

    try {
      await db.execute(`
        ALTER TABLE sensors 
        ADD COLUMN image_url TEXT
      `);
      console.log('✓ Added image_url column to sensors');
    } catch (error: any) {
      if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
        console.log('  image_url column already exists, skipping...');
      } else {
        throw error;
      }
    }

    try {
      await db.execute(`
        ALTER TABLE sensors 
        ADD COLUMN validated_at DATETIME
      `);
      console.log('✓ Added validated_at column to sensors');
    } catch (error: any) {
      if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
        console.log('  validated_at column already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Update existing projects to have NOT_COMPLETE status if they're unlocked but don't have completion status
    await db.execute(`
      UPDATE projects 
      SET pdd_completion_status = 'NOT_COMPLETE'
      WHERE pdd_status = 'UNLOCKED' AND (pdd_completion_status IS NULL OR pdd_completion_status = '')
    `);

    await db.execute(`
      UPDATE projects 
      SET sensor_activation_status = 'PENDING'
      WHERE sensor_activation_status IS NULL OR sensor_activation_status = ''
    `);

    console.log('✓ Updated existing projects with default completion status');
    console.log('\nMigration completed successfully!');
  } catch (error: any) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

