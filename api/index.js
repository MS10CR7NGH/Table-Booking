// Vercel Serverless Function wrapper for Express app
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, getDatabase } from '../server/config/database.js';
import bookingsRouter from '../server/routes/bookings.js';
import tablesRouter from '../server/routes/tables.js';
import menuRouter from '../server/routes/menu.js';
import settingsRouter from '../server/routes/settings.js';
import availabilityRouter from '../server/routes/availability.js';
import authRouter from '../server/routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Aura Dining API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      api: '/api',
      health: '/health',
      auth: '/api/auth',
      bookings: '/api/bookings',
      tables: '/api/tables',
      menu: '/api/menu',
      settings: '/api/settings',
      availability: '/api/availability'
    }
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const db = getDatabase();
    // Test database connection
    await db.admin().ping();
    res.json({ 
      status: 'ok', 
      message: 'Server đang hoạt động',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Aura Dining API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      bookings: '/api/bookings',
      tables: '/api/tables',
      menu: '/api/menu',
      settings: '/api/settings',
      availability: '/api/availability'
    },
    health: '/health'
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/menu', menuRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/availability', availabilityRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Lỗi server:', err);
  res.status(500).json({ error: 'Lỗi server nội bộ' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Không tìm thấy route',
    path: req.path,
    method: req.method
  });
});

// Ensure database is connected
let dbInitialized = false;
async function ensureDatabase() {
  if (!dbInitialized) {
    try {
      await connectDatabase();
      dbInitialized = true;
      console.log('✅ Database connected');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      throw error;
    }
  }
}

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    // Log request for debugging
    console.log('Request received:', {
      method: req.method,
      path: req.url,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasDatabaseName: !!process.env.DATABASE_NAME
    });

    // Ensure database is connected
    await ensureDatabase();
    
    // Handle request with Express app
    // Wrap in Promise to handle async properly
    return new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) {
          console.error('Express error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Handler error:', error);
    console.error('Error stack:', error.stack);
    console.error('Environment check:', {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasDatabaseName: !!process.env.DATABASE_NAME,
      mongoUriPreview: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL
    });
    
    // Return detailed error
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV !== 'production' ? {
          stack: error.stack,
          hasMongoUri: !!process.env.MONGODB_URI
        } : undefined
      });
    }
  }
}

