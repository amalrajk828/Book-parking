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

dotenv.config();

// Security checks
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'super_secret_smart_parking_token_key_12345') {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: JWT_SECRET is missing or insecure');
    process.exit(1);
  } else {
    console.warn('JWT_SECRET warning: using default or missing value');
  }
}

if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI missing');
  process.exit(1);
}

// Connect DB
connectDB();

const app = express();

/* =========================
   SECURITY MIDDLEWARE
========================= */
app.use(helmet());
app.use(mongoSanitize());

/* =========================
   RATE LIMIT
========================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests' }
});

app.use('/api/', limiter);

/* =========================
   CORS (FIXED - ALLOW ALL ORIGINS)
========================= */
app.use(cors({
  origin: true, // 🔥 allows ALL origins (fix for your issue)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.options('*', cors());

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* =========================
   ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/areas', parkingAreaRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/slots', parkingSlotRoutes);

/* =========================
   ROOT
========================= */
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Smart Parking API Server',
    time: new Date()
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use(errorHandler);

/* =========================
   SERVER START
========================= */
const startServer = (port) => {
  const server = app.listen(port);

  server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? address : `port ${address.port}`;

    console.log(`Server running on ${bind}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} already in use`);
      if (process.env.NODE_ENV !== 'production') {
        startServer(Number(port) + 1);
      } else {
        process.exit(1);
      }
    } else {
      throw error;
    }
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
  });
};

const PORT = process.env.PORT || 5000;
startServer(PORT);