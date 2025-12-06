# Malama CO2.0 Universal Carbon Market Operating System MVP

A full-stack MVP for the Malama CO2.0 Universal Carbon Market Operating System, built with Next.js, Express, and Turso/libsql.

## Features

- **4-Step Carbon Potential Analysis Flow**
  - Account creation with KYC/KYB
  - Interactive map-based project boundary definition with auto-calculated hectares
  - Instant carbon removal, revenue, and cost estimates (30-second analysis)
  - Pro account upgrade and project activation

- **Project Management**
  - Dynamic Project Design Document (PDD) generation with ICR compliance
  - Sensor deployment planning with detailed specifications and pricing
  - Dynamic financial package generation with NPV, payback period, and risk assessment
  - Live DMRV sensor data visualization with real-time updates
  - Sensor network map visualization with satellite view

- **Compliance & Verification**
  - **Taktikal-style KYC Verification**: Multi-step form with document upload, identity verification, and real-time background checks
  - **Taktikal-style KYB Verification**: Business verification with registration documents, beneficial ownership, and enhanced due diligence
  - KYC/KYB status tracking with completion workflows
  - Deliverable completion status with clear next steps
  - Sensor activation workflow with purchase flow
  - Real-time carbon credit tracking and issuance

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** Turso (libsql)
- **Maps:** Mapbox GL JS with react-map-gl
- **Authentication:** JWT tokens, bcrypt

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Turso database account
- Mapbox access token

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

Create a `.env.local` file:

```env
# Turso Database Configuration
TURSO_DATABASE_URL=libsql://your-database-url
TURSO_AUTH_TOKEN=your-auth-token

# Server Configuration
SERVER_PORT=3001
JWT_SECRET=your-secret-key-change-in-production

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

### Database Setup

```bash
# Initialize database schema
npm run init-db

# Run migration for completion status columns (if needed)
npm run migrate-completion-status

# Seed demo data (optional)
npm run seed
```

### Development

```bash
# Start Next.js frontend (terminal 1)
npm run dev

# Start Express backend (terminal 2)
npm run server
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── analyze/           # 4-step analysis flow
│   ├── projects/           # Project detail pages
│   ├── dashboard/          # User dashboard
│   └── components/        # React components
├── server/                # Express backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── db/               # Database client
├── db/                    # Database schema
├── scripts/               # Utility scripts
└── public/                # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user and organization
- `POST /api/auth/login` - User login

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects/all?orgId=...` - List projects for organization
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/:id/activate` - Activate project (unlock deliverables)
- `GET /api/projects/:id/generate-pdd` - Generate PDD document
- `POST /api/projects/:id/update-kyc` - Update KYC status (simulate verification)
- `POST /api/projects/:id/update-kyb` - Update KYB status (simulate verification)
- `POST /api/projects/:id/update-info` - Update project additional information
- `POST /api/projects/:id/activate-sensors` - Activate sensor network

### Analysis
- `POST /api/analysis/estimate` - Calculate carbon potential estimates

### Sensors & Credits
- `GET /api/sensors/:projectId` - Get all sensors for a project
- `POST /api/sensors/register` - Register sensor
- `GET /api/data/:sensorId/stream` - Get live sensor data
- `POST /api/credits/:projectId/issue` - Issue carbon credits
- `GET /api/credits/:projectId` - Get project credits

## Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

## Database Schema

The application uses the following main tables:
- `organizations` - Organization data (KYB)
- `users` - User accounts (KYC)
- `projects` - Carbon projects
- `sensors` - DMRV sensor network
- `credits` - Carbon credits

See `db/schema.sql` for the complete schema.

## Key Features Explained

### Taktikal-Style KYC/KYB Verification
The platform includes comprehensive multi-step verification forms inspired by Taktikal's API:
- **KYC Flow**: Personal information → Identity document upload → Real-time verification
- **KYB Flow**: Business information → Registration documents → Enhanced due diligence
- Supports 11,000+ government-issued IDs from 190+ countries
- Real-time identity verification with document authenticity checks
- Background screening and sanctions/PEP checks

### KYC/KYB Gating
Deliverables show "NOT COMPLETE" status until KYC/KYB verification is approved. The system provides clear next steps with clickable action buttons for completing verification.

### Sensor Activation Workflow
Sensors must be ordered through the purchase flow, deployed, geolocated, and validated online before live DMRV data is displayed. The sensor network map visualizes all deployed sensors with their status.

### Dynamic PDD Generation
Project Design Documents are automatically generated based on project data, technology type, and boundary information. PDDs are ICR-compliant and include all required sections.

### Dynamic Financial Package
Financial packages are automatically calculated based on project metrics:
- Revenue projections with credit pricing
- CAPEX and OPEX breakdowns
- NPV calculations with discount rates
- Payback period analysis
- Risk assessment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For questions or issues, please open an issue on GitHub.
