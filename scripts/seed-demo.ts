/**
 * Seed script for demo data
 * Creates the biochar250 project and associated sensor for the live demo
 */

import { db } from '../server/db/libsql-client';
import { v4 as uuidv4 } from 'uuid';

const DEMO_ORG_ID = 'demo-org-biochar';
const DEMO_PROJECT_ID = 'biochar250';
const DEMO_SENSOR_ID = 'sensor-123-bc';

async function seedDemo() {
  try {
    console.log('🌱 Seeding demo data...');

    // Create demo organization
    try {
      await db.execute({
        sql: `INSERT INTO organizations (id, legal_name, reg_number, kyb_status, proponent_role)
              VALUES (?, ?, ?, ?, ?)`,
        args: [DEMO_ORG_ID, 'Idaho Biochar Restoration LLC', 'ID-2024-BC-001', 'APPROVED', 'Project Proponent'],
      });
      console.log('✅ Created demo organization');
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint')) {
        console.log('ℹ️  Demo organization already exists');
      } else {
        throw error;
      }
    }

    // Create demo project
    try {
      await db.execute({
        sql: `INSERT INTO projects (
          id, org_id, name, status, hectares, tech_type, gps_boundary,
          est_removal, est_revenue, upfront_cost,
          pdd_status, sensor_map_status, financial_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          DEMO_PROJECT_ID,
          DEMO_ORG_ID,
          'Idaho Biochar Restoration Project',
          'Live',
          250,
          'Biochar',
          JSON.stringify({ lat: 44.2405, lng: -116.9636, bounds: [] }),
          12500,
          1875000,
          16574,
          'UNLOCKED',
          'UNLOCKED',
          'UNLOCKED',
        ],
      });
      console.log('✅ Created demo project');
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint')) {
        console.log('ℹ️  Demo project already exists');
      } else {
        throw error;
      }
    }

    // Create demo sensor
    try {
      await db.execute({
        sql: `INSERT INTO sensors (id, project_id, serial_num, location, param)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          DEMO_SENSOR_ID,
          DEMO_PROJECT_ID,
          'MALAMA-SENSOR-123-BC',
          JSON.stringify({ lat: 44.2405, lng: -116.9636 }),
          'SoilCarbon',
        ],
      });
      console.log('✅ Created demo sensor');
    } catch (error: any) {
      if (error.message?.includes('UNIQUE constraint')) {
        console.log('ℹ️  Demo sensor already exists');
      } else {
        throw error;
      }
    }

    // Create some demo credits
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      const creditId = uuidv4();
      try {
        await db.execute({
          sql: `INSERT INTO credits (id, project_id, vintage, tonnes, sale_price, status)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            creditId,
            DEMO_PROJECT_ID,
            currentYear,
            100 + Math.random() * 50, // Random between 100-150 tonnes
            150, // $150 per tonne
            'Issued',
          ],
        });
      } catch (error: any) {
        // Ignore duplicates
      }
    }
    console.log('✅ Created demo credits');

    console.log('🎉 Demo data seeded successfully!');
    console.log(`\n📊 Demo Project: ${DEMO_PROJECT_ID}`);
    console.log(`🔌 Demo Sensor: ${DEMO_SENSOR_ID}`);
    console.log(`\nVisit: http://localhost:3000/projects/${DEMO_PROJECT_ID}`);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemo().then(() => {
  process.exit(0);
});

