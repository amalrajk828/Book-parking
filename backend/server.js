import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import parkingAreaRoutes from './routes/parkingAreaRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import parkingSlotRoutes from './routes/parkingSlotRoutes.js';

// Load Env variables
dotenv.config();

// Check critical environment variables for production readiness
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'super_secret_smart_parking_token_key_12345') {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: JWT_SECRET is missing or using insecure default key in production mode! Process exiting.');
    process.exit(1);
  } else {
    console.warn('SECURITY WARNING: JWT_SECRET is unset or using a default insecure key. Please configure this before deployment!');
  }
}

if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is missing from your environment config! Process exiting.');
  process.exit(1);
}

// Connect Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// Standard Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://book-parking-1z1uu8bir-amalraj.vercel.app'
];

if (process.env.FRONTEND_URL) {
  const origins = process.env.FRONTEND_URL.split(',').map((o) => o.trim());
  origins.forEach((o) => {
    if (o && !allowedOrigins.includes(o)) {
      allowedOrigins.push(o);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) ||
      /^https:\/\/book-parking-[a-zA-Z0-9-]+-amalraj\.vercel\.app$/.test(origin) ||
      /^https:\/\/book-parking-.*\.vercel\.app$/.test(origin);
      
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS BLOCKED] Request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
// Handle preflight OPTIONS requests across all routes
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/areas', parkingAreaRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/slots', parkingSlotRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Smart Parking API Server',
    time: new Date()
  });
});

// Centralized error handler
app.use(errorHandler);

// Port configuration & graceful EADDRINUSE conflict handler
const startServer = (port) => {
  const server = app.listen(port);

  server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? address : `port ${address.port}`;
    console.log(`\n==================================================`);
    console.log(`[SERVER START SUCCESS]`);
    console.log(`Smart Parking API Server is online and listening on ${bind}`);
    console.log(`Environment Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Local Time: ${new Date().toLocaleString()}`);
    console.log(`==================================================\n`);
  });

  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EADDRINUSE':
        console.error(`[PORT CONFLICT] Port ${port} is already in use by another process.`);
        if (process.env.NODE_ENV !== 'production') {
          const fallbackPort = Number(port) + 1;
          console.warn(`[PORT RESOLUTION] Dev Mode: Attempting to launch on fallback port ${fallbackPort} instead...`);
          startServer(fallbackPort);
        } else {
          console.error('FATAL PORT ERROR: Chosen port is occupied in production mode. Process exiting.');
          process.exit(1);
        }
        break;
      default:
        throw error;
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.error(`[UNHANDLED REJECTION] Critical Error: ${err.message}`);
    // Safe shutdown loop: server.close(() => process.exit(1));
  });
};

const initialPort = process.env.PORT || 5000;
startServer(initialPort);
