# Vercel Deployment Guide for Malama CO2.0 MVP

This guide will help you deploy the Malama CO2.0 Universal Carbon Market Operating System MVP to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Turso database (already configured)

## Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Malama CO2.0 MVP"

# Add remote repository
git remote add origin https://github.com/tylermalin/carbonmvp.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy Backend to Vercel

The backend Express server needs to be deployed separately. You have two options:

### Option A: Deploy Backend as Vercel Serverless Functions

1. Create `api/` directory in the root
2. Move Express routes to Vercel serverless functions (recommended for production)

### Option B: Deploy Backend Separately (Recommended for MVP)

For the MVP, we'll deploy the backend separately using a service like Railway, Render, or Fly.io.

**Using Railway:**

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Add environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `SERVER_PORT=3001`
   - `JWT_SECRET=your-secret-key`
5. Set start command: `npm run server`
6. Deploy

**Using Render:**

1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set:
   - Build Command: `npm install`
   - Start Command: `npm run server`
5. Add environment variables (same as Railway)
6. Deploy

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository (`tylermalin/carbonmvp`)
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoidHlsZXJtYWxpbiIsImEiOiJjbTdydW9nY2UwOGVoMnFwcTJ3dnM0ZzVyIn0.ole4jmDTXSbcxa6orNdZMg
   ```

6. Click "Deploy"

## Step 4: Database Migration

Before deploying, run the migration script to add the new completion status columns:

```bash
# Run migration locally or on your backend server
npm run migrate-completion-status
```

Or manually add the columns using Turso CLI:

```bash
turso db shell malama-db-tylermalin
```

Then run:
```sql
ALTER TABLE projects ADD COLUMN pdd_completion_status TEXT DEFAULT 'NOT_COMPLETE';
ALTER TABLE projects ADD COLUMN sensor_activation_status TEXT DEFAULT 'PENDING';
ALTER TABLE sensors ADD COLUMN activation_status TEXT DEFAULT 'PENDING';
ALTER TABLE sensors ADD COLUMN geolocation TEXT;
ALTER TABLE sensors ADD COLUMN image_url TEXT;
ALTER TABLE sensors ADD COLUMN validated_at DATETIME;
```

## Step 5: Update Frontend API URL

After deploying the backend, update the `NEXT_PUBLIC_API_URL` environment variable in Vercel to point to your deployed backend URL.

## Environment Variables Summary

### Backend (Railway/Render):
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `SERVER_PORT=3001`
- `JWT_SECRET`

### Frontend (Vercel):
- `NEXT_PUBLIC_API_URL` (your backend URL)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

## Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database migration completed
- [ ] Environment variables configured
- [ ] Test registration flow
- [ ] Test project creation
- [ ] Test project detail page

## Troubleshooting

### CORS Issues
If you see CORS errors, ensure your backend CORS configuration includes your Vercel frontend URL:

```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-vercel-app.vercel.app'],
  credentials: true
}));
```

### Database Connection Issues
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correct
- Check that your Turso database is accessible from the deployment region

### Build Errors
- Ensure all dependencies are in `package.json`
- Check that TypeScript compilation succeeds locally before deploying

## Quick Start Commands

```bash
# Local development
npm install
npm run init-db          # Initialize database schema
npm run migrate-completion-status  # Add new columns
npm run dev              # Start Next.js frontend
npm run server           # Start Express backend (in separate terminal)

# Production deployment
git push origin main     # Push to GitHub
# Then deploy via Vercel dashboard
```

## Support

For issues or questions, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Turso Documentation](https://docs.turso.tech)
- [Next.js Documentation](https://nextjs.org/docs)

