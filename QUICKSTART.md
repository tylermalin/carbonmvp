# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables
Create `.env.local` file:
```env
TURSO_DATABASE_URL=libsql://malama-db-tylermalin.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=
SERVER_PORT=3001
JWT_SECRET=dev-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Note**: If your Turso database requires authentication, add your `TURSO_AUTH_TOKEN` to the `.env.local` file.

### Step 3: Start the Backend Server
```bash
npm run server
```
This will start the Express API server on port 3001 and automatically initialize the database schema.

### Step 4: (Optional) Seed Demo Data
In a new terminal:
```bash
npm run seed
```
This creates the `biochar250` demo project with sensor and credits data.

### Step 5: Start the Frontend
In a new terminal:
```bash
npm run dev
```
This starts the Next.js development server on port 3000.

### Step 6: Open Your Browser
Navigate to:
- **Landing Page**: http://localhost:3000
- **Live Demo Project**: http://localhost:3000/projects/biochar250
- **Registration Flow**: http://localhost:3000/register

## 🎯 Key Features to Test

1. **Landing Page**: Click "View a Live Project" to see the demo
2. **Registration Flow**: Complete the 3-step registration process
3. **Live Project Demo**: View real-time sensor data and credit counter
4. **API Endpoints**: Test via Postman or curl at http://localhost:3001/api

## 🔧 Troubleshooting

### Database Connection Issues
- Verify your `TURSO_DATABASE_URL` is correct
- Check if `TURSO_AUTH_TOKEN` is required and set correctly
- Ensure the database exists in your Turso dashboard

### Port Already in Use
- Change `SERVER_PORT` in `.env.local` if 3001 is taken
- Update `NEXT_PUBLIC_API_URL` accordingly
- Modify `next.config.js` rewrites if needed

### Schema Initialization Errors
- The schema auto-initializes on server start
- If tables already exist, errors are safely ignored
- Run `npm run init-db` manually if needed

## 📚 Next Steps

- Review the full [README.md](./README.md) for detailed documentation
- Explore the API endpoints in `server/routes/api.ts`
- Customize the UI components in `app/`
- Add your own project data via the registration flow

