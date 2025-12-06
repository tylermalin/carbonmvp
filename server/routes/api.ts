import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/libsql-client';
import { generatePDD } from '../services/pdd-generator';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to generate JWT
function generateToken(userId: string, orgId: string) {
  return jwt.sign({ userId, orgId }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register - Combined user and organization registration
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, legalName, regNumber, proponentRole } = req.body;

    if (!email || !password || !legalName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create organization
    const orgId = uuidv4();
    await db.execute({
      sql: `INSERT INTO organizations (id, legal_name, reg_number, kyb_status, proponent_role)
            VALUES (?, ?, ?, ?, ?)`,
      args: [orgId, legalName, regNumber || null, 'PENDING', proponentRole || null],
    });

    // Create user
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, org_id, kyc_status)
            VALUES (?, ?, ?, ?, ?)`,
      args: [userId, email, passwordHash, orgId, 'PENDING'],
    });

    const token = generateToken(userId, orgId);

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, email, orgId },
      organization: { id: orgId, legalName },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.message?.includes('UNIQUE constraint') || error.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already registered', code: 'EMAIL_EXISTS' });
    }
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// POST /api/auth/login - User login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const userResult = await db.execute({
      sql: `SELECT u.id, u.email, u.password_hash, u.org_id, o.legal_name 
            FROM users u 
            JOIN organizations o ON u.org_id = o.id 
            WHERE u.email = ?`,
      args: [email],
    });

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0] as any;
    const passwordHash = user.password_hash as string;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id, user.org_id);

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, orgId: user.org_id },
      organization: { id: user.org_id, legalName: user.legal_name },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// POST /api/projects - Create a new project
router.post('/projects', async (req, res) => {
  try {
    const {
      orgId,
      name,
      hectares,
      techType,
      gpsBoundary,
      estRemoval,
      estRevenue,
      upfrontCost,
    } = req.body;

    if (!orgId || !name) {
      return res.status(400).json({ error: 'Missing required fields: orgId and name' });
    }

    const projectId = uuidv4();
    // Try to insert with new columns, fallback if they don't exist
    try {
      await db.execute({
        sql: `INSERT INTO projects (
          id, org_id, name, status, hectares, tech_type, gps_boundary,
          est_removal, est_revenue, upfront_cost,
          pdd_status, sensor_map_status, financial_status,
          pdd_completion_status, sensor_activation_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          projectId,
          orgId,
          name,
          'Draft',
          hectares || null,
          techType || null,
          gpsBoundary ? JSON.stringify(gpsBoundary) : null,
          estRemoval || null,
          estRevenue || null,
          upfrontCost || null,
          'LOCKED',
          'LOCKED',
          'LOCKED',
          'NOT_COMPLETE',
          'PENDING',
        ],
      });
    } catch (error: any) {
      // If columns don't exist, insert without them
      if (error.message?.includes('no such column')) {
        await db.execute({
          sql: `INSERT INTO projects (
            id, org_id, name, status, hectares, tech_type, gps_boundary,
            est_removal, est_revenue, upfront_cost,
            pdd_status, sensor_map_status, financial_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            projectId,
            orgId,
            name,
            'Draft',
            hectares || null,
            techType || null,
            gpsBoundary ? JSON.stringify(gpsBoundary) : null,
            estRemoval || null,
            estRevenue || null,
            upfrontCost || null,
            'LOCKED',
            'LOCKED',
            'LOCKED',
          ],
        });
      } else {
        throw error;
      }
    }

    res.status(201).json({
      success: true,
      project: {
        id: projectId,
        name,
        status: 'Draft',
        pdd_status: 'LOCKED',
        sensor_map_status: 'LOCKED',
        financial_status: 'LOCKED',
      },
    });
  } catch (error: any) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'Project creation failed', details: error.message });
  }
});

// GET /api/projects/all - List all projects for an organization
router.get('/projects/all', async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!orgId) {
      return res.status(400).json({ error: 'Missing orgId query parameter' });
    }

    // Try to select with new columns, fallback if they don't exist
    let result;
    try {
      result = await db.execute({
        sql: `SELECT id, name, status, hectares, tech_type, est_removal, est_revenue,
                     pdd_status, sensor_map_status, financial_status,
                     COALESCE(pdd_completion_status, 'NOT_COMPLETE') as pdd_completion_status,
                     COALESCE(sensor_activation_status, 'PENDING') as sensor_activation_status,
                     created_at
              FROM projects WHERE org_id = ? ORDER BY created_at DESC`,
        args: [orgId as string],
      });
    } catch (error: any) {
      // If columns don't exist, select without them
      if (error.message?.includes('no such column')) {
        result = await db.execute({
          sql: `SELECT id, name, status, hectares, tech_type, est_removal, est_revenue,
                       pdd_status, sensor_map_status, financial_status, created_at
                FROM projects WHERE org_id = ? ORDER BY created_at DESC`,
          args: [orgId as string],
        });
      } else {
        throw error;
      }
    }

    res.json({
      success: true,
      projects: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        status: row.status,
        hectares: row.hectares,
        techType: row.tech_type,
        estRemoval: row.est_removal,
        estRevenue: row.est_revenue,
        pddStatus: row.pdd_status,
        sensorMapStatus: row.sensor_map_status,
        financialStatus: row.financial_status,
        pddCompletionStatus: row.pdd_completion_status || 'NOT_COMPLETE',
        sensorActivationStatus: row.sensor_activation_status || 'PENDING',
        createdAt: row.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Projects fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch projects', details: error.message });
  }
});

// GET /api/projects/:id - Get a single project
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to select with new columns, fallback if they don't exist
    let result;
    try {
      result = await db.execute({
        sql: `SELECT p.*, o.kyb_status, 
                     (SELECT kyc_status FROM users WHERE org_id = p.org_id LIMIT 1) as kyc_status,
                     COALESCE(p.pdd_completion_status, 'NOT_COMPLETE') as pdd_completion_status,
                     COALESCE(p.sensor_activation_status, 'PENDING') as sensor_activation_status
              FROM projects p
              JOIN organizations o ON p.org_id = o.id
              WHERE p.id = ?`,
        args: [id],
      });
    } catch (error: any) {
      // If columns don't exist, select without them
      if (error.message?.includes('no such column')) {
        result = await db.execute({
          sql: `SELECT p.*, o.kyb_status, 
                       (SELECT kyc_status FROM users WHERE org_id = p.org_id LIMIT 1) as kyc_status
                FROM projects p
                JOIN organizations o ON p.org_id = o.id
                WHERE p.id = ?`,
          args: [id],
        });
      } else {
        throw error;
      }
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = result.rows[0] as any;
    res.json({
      success: true,
      project: {
        id: project.id,
        orgId: project.org_id,
        name: project.name,
        status: project.status,
        hectares: project.hectares,
        techType: project.tech_type,
        gpsBoundary: project.gps_boundary ? JSON.parse(project.gps_boundary) : null,
        estRemoval: project.est_removal,
        estRevenue: project.est_revenue,
        upfrontCost: project.upfront_cost,
        pddStatus: project.pdd_status,
        sensorMapStatus: project.sensor_map_status,
        financialStatus: project.financial_status,
        pddCompletionStatus: project.pdd_completion_status || 'NOT_COMPLETE',
        sensorActivationStatus: project.sensor_activation_status || 'PENDING',
        kycStatus: project.kyc_status || 'PENDING',
        kybStatus: project.kyb_status || 'PENDING',
        createdAt: project.created_at,
      },
    });
  } catch (error: any) {
    console.error('Project fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch project', details: error.message });
  }
});

// GET /api/projects/:id/generate-pdd - Generate PDD document
router.get('/projects/:id/generate-pdd', async (req, res) => {
  try {
    const { id } = req.params;

    // Handle demo project biochar250 with hardcoded data
    if (id === 'biochar250') {
      try {
        const demoProjectData = {
          projectName: 'Idaho Biochar Restoration Project',
          orgName: 'Idaho Biochar Restoration LLC',
          authorizedRepName: undefined,
          authorizedRepEmail: undefined,
          techType: 'Biochar',
          hectares: 250,
          gpsBoundary: { lat: 44.2405, lng: -116.9636 },
          estRemoval: 12500,
          estRevenue: 1875000,
          upfrontCost: 16574,
        };

        const demoOrgData = {
          legalName: 'Idaho Biochar Restoration LLC',
          regNumber: 'ID-2024-BC-001',
        };

        console.log('Generating PDD for demo project biochar250');
        const pddContent = generatePDD(demoProjectData, demoOrgData);
        
        if (!pddContent || pddContent.length === 0) {
          throw new Error('Generated PDD content is empty');
        }
        
        return res.json({
          success: true,
          content: pddContent,
          projectId: id,
          generatedAt: new Date().toISOString(),
        });
      } catch (demoError: any) {
        console.error('Error generating PDD for biochar250:', demoError);
        console.error('Error stack:', demoError.stack);
        console.error('Error details:', JSON.stringify(demoError, null, 2));
        return res.status(500).json({ 
          error: 'Failed to generate PDD', 
          details: demoError.message,
          stack: process.env.NODE_ENV === 'development' ? demoError.stack : undefined
        });
      }
    }

    // Fetch project data from database
    const projectResult = await db.execute({
      sql: `SELECT * FROM projects WHERE id = ?`,
      args: [id],
    });

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // Fetch organization data
    let orgData = null;
    if (project.org_id) {
      const orgResult = await db.execute({
        sql: `SELECT * FROM organizations WHERE id = ?`,
        args: [project.org_id],
      });

      if (orgResult.rows.length > 0) {
        const orgRow = orgResult.rows[0] as any;
        orgData = {
          legalName: String(orgRow.legal_name || 'Organization'),
          regNumber: orgRow.reg_number ? String(orgRow.reg_number) : undefined,
        };
      }
    }

    // Parse GPS boundary if it's a JSON string
    let gpsBoundary: string | { lat?: number; lng?: number } | undefined = undefined;
    if (project.gps_boundary) {
      if (typeof project.gps_boundary === 'string') {
        try {
          const parsed = JSON.parse(project.gps_boundary);
          gpsBoundary = parsed;
        } catch (e) {
          // If parsing fails, use as string
          gpsBoundary = project.gps_boundary;
        }
      } else if (typeof project.gps_boundary === 'object') {
        gpsBoundary = project.gps_boundary as { lat?: number; lng?: number };
      }
    }

    // Prepare project data for PDD generation
    const projectData = {
      projectName: String(project.name || 'Unnamed Project'),
      orgName: String(orgData?.legalName || 'Organization'),
      authorizedRepName: undefined as string | undefined, // Can be added later
      authorizedRepEmail: undefined as string | undefined, // Can be added later
      techType: String(project.tech_type || 'Unknown'),
      hectares: Number(project.hectares) || 0,
      gpsBoundary: gpsBoundary,
      estRemoval: Number(project.est_removal) || 0,
      estRevenue: Number(project.est_revenue) || 0,
      upfrontCost: Number(project.upfront_cost) || 0,
    };

    // Generate PDD
    let pddContent: string;
    try {
      console.log('Generating PDD for project:', id);
      console.log('Project data:', JSON.stringify(projectData, null, 2));
      console.log('Org data:', JSON.stringify(orgData, null, 2));
      
      const orgDataTyped: { legalName: string; regNumber?: string } | undefined = orgData 
        ? {
            legalName: String(orgData.legalName || 'Organization'),
            regNumber: orgData.regNumber ? String(orgData.regNumber) : undefined,
          }
        : undefined;
      
      pddContent = generatePDD(projectData, orgDataTyped);
      
      if (!pddContent || pddContent.length === 0) {
        throw new Error('Generated PDD content is empty');
      }
      
      console.log('PDD generated successfully, length:', pddContent.length);
    } catch (genError: any) {
      console.error('PDD generation function error:', genError);
      console.error('Error stack:', genError.stack);
      throw new Error(`PDD generation failed: ${genError.message}`);
    }

    res.json({
      success: true,
      content: pddContent,
      projectId: id,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('PDD generation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to generate PDD', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/projects/:id/activate - Activate project (unlock deliverables)
router.post('/projects/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentConfirmed } = req.body;

    if (!paymentConfirmed) {
      return res.status(400).json({ error: 'Payment confirmation required' });
    }

    // Fetch project and organization data to check KYC/KYB status
    const projectResult = await db.execute({
      sql: `SELECT p.*, o.kyb_status, 
                   (SELECT kyc_status FROM users WHERE org_id = p.org_id LIMIT 1) as kyc_status
            FROM projects p
            JOIN organizations o ON p.org_id = o.id
            WHERE p.id = ?`,
      args: [id],
    });

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0] as any;
    const kybStatus = project.kyb_status;
    const kycStatus = project.kyc_status;

    // Check if KYC/KYB is complete
    const isKycKybComplete = kybStatus === 'APPROVED' && kycStatus === 'APPROVED';
    
    // Set completion status based on KYC/KYB
    const pddCompletionStatus = isKycKybComplete ? 'COMPLETE' : 'NOT_COMPLETE';
    const sensorCompletionStatus = isKycKybComplete ? 'READY' : 'NOT_COMPLETE';

    await db.execute({
      sql: `UPDATE projects 
            SET status = 'Live',
                pdd_status = 'UNLOCKED',
                sensor_map_status = 'UNLOCKED',
                financial_status = 'UNLOCKED',
                pdd_completion_status = ?,
                sensor_activation_status = ?
            WHERE id = ?`,
      args: [pddCompletionStatus, sensorCompletionStatus, id],
    });

    res.json({
      success: true,
      message: isKycKybComplete 
        ? 'Project activated successfully. All deliverables unlocked and complete.'
        : 'Project activated successfully. Deliverables unlocked but require KYC/KYB completion.',
      project: {
        id,
        status: 'Live',
        pddStatus: 'UNLOCKED',
        sensorMapStatus: 'UNLOCKED',
        financialStatus: 'UNLOCKED',
        pddCompletionStatus,
        sensorActivationStatus: sensorCompletionStatus,
        kycStatus,
        kybStatus,
      },
    });
  } catch (error: any) {
    console.error('Project activation error:', error);
    res.status(500).json({ error: 'Project activation failed', details: error.message });
  }
});

// POST /api/sensors/register - Register a new sensor
router.post('/sensors/register', async (req, res) => {
  try {
    const { projectId, serialNum, location, param } = req.body;

    if (!projectId || !serialNum) {
      return res.status(400).json({ error: 'Missing required fields: projectId and serialNum' });
    }

    const sensorId = uuidv4();
    await db.execute({
      sql: `INSERT INTO sensors (id, project_id, serial_num, location, param)
            VALUES (?, ?, ?, ?, ?)`,
      args: [sensorId, projectId, serialNum, location || null, param || 'SoilCarbon'],
    });

    res.status(201).json({
      success: true,
      sensor: {
        id: sensorId,
        projectId,
        serialNum,
        location,
        param: param || 'SoilCarbon',
      },
    });
  } catch (error: any) {
    console.error('Sensor registration error:', error);
    if (error.message?.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Serial number already registered' });
    }
    res.status(500).json({ error: 'Sensor registration failed', details: error.message });
  }
});

// GET /api/data/:sensorId/stream - Simulated live sensor data
router.get('/data/:sensorId/stream', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    // Generate simulated time-series data
    const data = [];
    const now = Date.now();
    const baseValue = 4.2; // Base soil carbon concentration in ppm

    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = new Date(now - i * 60000); // 1 minute intervals
      const variation = (Math.random() - 0.5) * 0.3; // ±0.15 variation
      const value = baseValue + variation + (i * 0.01); // Slight upward trend

      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.round(value * 100) / 100,
        unit: 'ppm',
        sensorId,
      });
    }

    res.json({
      success: true,
      sensorId,
      data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Data stream error:', error);
    res.status(500).json({ error: 'Failed to fetch sensor data', details: error.message });
  }
});

// POST /api/credits/:projectId/issue - Simulate credit issuance
router.post('/credits/:projectId/issue', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tonnes, vintage, salePrice } = req.body;

    if (!tonnes) {
      return res.status(400).json({ error: 'Missing required field: tonnes' });
    }

    const creditId = uuidv4();
    const currentYear = new Date().getFullYear();

    await db.execute({
      sql: `INSERT INTO credits (id, project_id, vintage, tonnes, sale_price, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        creditId,
        projectId,
        vintage || currentYear,
        tonnes,
        salePrice || null,
        'Issued',
      ],
    });

    res.status(201).json({
      success: true,
      credit: {
        id: creditId,
        projectId,
        vintage: vintage || currentYear,
        tonnes,
        salePrice: salePrice || null,
        status: 'Issued',
      },
    });
  } catch (error: any) {
    console.error('Credit issuance error:', error);
    res.status(500).json({ error: 'Credit issuance failed', details: error.message });
  }
});

// GET /api/credits/:projectId - Get credits for a project
router.get('/credits/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await db.execute({
      sql: `SELECT * FROM credits WHERE project_id = ? ORDER BY created_at DESC`,
      args: [projectId],
    });

    const totalTonnes = result.rows.reduce((sum, row) => {
      const tonnes = Number((row as any).tonnes) || 0;
      return sum + tonnes;
    }, 0);

    res.json({
      success: true,
      credits: result.rows.map((row) => ({
        id: row.id,
        projectId: row.project_id,
        vintage: row.vintage,
        tonnes: row.tonnes,
        salePrice: row.sale_price,
        status: row.status,
        createdAt: row.created_at,
      })),
      totalTonnes,
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Credits fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch credits', details: error.message });
  }
});

export default router;

