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

## Step 2: Deploy Backend to Render ✅

**Your backend is already deployed at:** `https://carbonmvp.onrender.com`

### Backend Configuration on Render

Make sure your Render service has these environment variables configured:

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your service: `srv-d4q1l9uuk2gs73fen75g`
3. Go to **Environment** tab
4. Add/verify these environment variables:

```env
TURSO_DATABASE_URL=libsql://malama-db-tylermalin.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token-here
SERVER_PORT=3001
JWT_SECRET=your-secure-random-secret-key-at-least-32-characters
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Note:** Update `FRONTEND_URL` with your actual Vercel frontend URL after deploying (e.g., `https://carbonmvp.vercel.app`)

### Render Service Settings

- **Build Command:** `npm install`
- **Start Command:** `npm run server`
- **Auto-Deploy:** Enabled (deploys on push to `main` branch)

### Important Notes for Render Free Tier

⚠️ **Free tier limitations:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds (cold start)
- Consider upgrading to paid tier for production use

### Verify Backend is Running

Test your backend health endpoint:
```bash
curl https://carbonmvp.onrender.com/health
```

You should get: `{"status":"ok","timestamp":"..."}`

Or test an API endpoint:
```bash
curl https://carbonmvp.onrender.com/api/projects/all?orgId=test
```

You should get a JSON response (even if empty array).

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
   NEXT_PUBLIC_API_URL=https://carbonmvp.onrender.com
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoidHlsZXJtYWxpbiIsImEiOiJjbTdydW9nY2UwOGVoMnFwcTJ3dnM0ZzVyIn0.ole4jmDTXSbcxa6orNdZMg
   ```

   **Important:** Use `https://carbonmvp.onrender.com` (no trailing slash) as your `NEXT_PUBLIC_API_URL`

6. Click "Deploy"

## Step 4: Database Migration

**Important:** Run the migration script to add the new completion status columns before using the application.

### Option A: Run Migration Script (Recommended)

You can run this locally before deploying, or add it as a one-time script on your backend server:

```bash
# Run migration locally (requires .env.local with database credentials)
npm run migrate-completion-status
```

**Note:** This script will:
- Add `pdd_completion_status` and `sensor_activation_status` columns to `projects` table
- Add `activation_status`, `geolocation`, `image_url`, and `validated_at` columns to `sensors` table
- Safely skip columns that already exist
- Set default values for existing projects

### Option B: Manual Migration via Turso CLI

If you prefer to run SQL manually:

```bash
# Connect to your Turso database
turso db shell malama-db-tylermalin
```

Then run these SQL commands:
```sql
ALTER TABLE projects ADD COLUMN pdd_completion_status TEXT DEFAULT 'NOT_COMPLETE';
ALTER TABLE projects ADD COLUMN sensor_activation_status TEXT DEFAULT 'PENDING';
ALTER TABLE sensors ADD COLUMN activation_status TEXT DEFAULT 'PENDING';
ALTER TABLE sensors ADD COLUMN geolocation TEXT;
ALTER TABLE sensors ADD COLUMN image_url TEXT;
ALTER TABLE sensors ADD COLUMN validated_at DATETIME;
```

**When to run:** 
- ✅ Run once before first deployment
- ✅ Run if you're upgrading an existing database
- ✅ The API will work without these columns (with fallbacks), but completion status features won't function properly until migration is complete

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
If you see CORS errors:

1. **Update CORS in `server/index.ts`** - The code has been updated to support dynamic origins
2. **Set `FRONTEND_URL` environment variable** in Render dashboard with your Vercel URL
3. **Redeploy backend** after making changes

The backend code already includes CORS configuration that will allow your Vercel domain once you set the `FRONTEND_URL` environment variable in Render.

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

