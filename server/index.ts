import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/libsql-client';
import apiRoutes from './routes/api';
import analysisRoutes from './routes/analysis';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware - CORS configuration
// Allow Vercel deployments and localhost for development
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://carbonmvp.vercel.app',
  'https://carbonmvp-omega.vercel.app',
].filter(Boolean);

// Check if origin is a Vercel deployment
const isVercelOrigin = (origin: string): boolean => {
  return origin.includes('.vercel.app') || origin.includes('localhost:3000');
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow Vercel deployments and localhost
    if (isVercelOrigin(origin) || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Initialize database on startup
initializeDatabase().then(() => {
  console.log('Database ready');
});

// API routes
app.use('/api', apiRoutes);
app.use('/api/analysis', analysisRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Malama CO2.0 API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: 'See README.md for API documentation'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
});

