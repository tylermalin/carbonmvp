-- Malama CO2.0 Database Schema
-- Turso/libsql compatible SQL

-- Organizations table (KYB)
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    legal_name TEXT NOT NULL,
    reg_number TEXT,
    kyb_status TEXT DEFAULT 'PENDING',
    proponent_role TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table (KYC)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    org_id TEXT,
    kyc_status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    hectares REAL,
    tech_type TEXT,
    gps_boundary TEXT,
    est_removal REAL,
    est_revenue REAL,
    upfront_cost REAL,
    pdd_status TEXT DEFAULT 'LOCKED',
    sensor_map_status TEXT DEFAULT 'LOCKED',
    financial_status TEXT DEFAULT 'LOCKED',
    pdd_completion_status TEXT DEFAULT 'NOT_COMPLETE',
    sensor_activation_status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sensors table (DMRV)
CREATE TABLE IF NOT EXISTS sensors (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    serial_num TEXT UNIQUE NOT NULL,
    location TEXT,
    param TEXT DEFAULT 'SoilCarbon',
    activation_status TEXT DEFAULT 'PENDING',
    geolocation TEXT,
    image_url TEXT,
    validated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Credits table
CREATE TABLE IF NOT EXISTS credits (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    vintage INTEGER,
    tonnes REAL NOT NULL,
    sale_price REAL,
    status TEXT DEFAULT 'Issued',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_sensors_project_id ON sensors(project_id);
CREATE INDEX IF NOT EXISTS idx_credits_project_id ON credits(project_id);

