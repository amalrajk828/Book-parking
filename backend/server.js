import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import parkingAreaRoutes from './routes/parkingAreaRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import parkingSlotRoutes from './routes/parkingSlotRoutes.js';

dotenv.config();

/* =========================
   SECURITY CHECKS
========================= */
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET missing');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI missing');
  process.exit(1);
}

/* =========================
   DB CONNECT
========================= */
connectDB();

const app = express();

/* =========================
   SECURITY MIDDLEWARE
========================= */
app.use(helmet());
app.use(mongoSanitize());

/* =========================
   CORS (FIXED - NO ORIGIN TRUE ISSUE)
========================= */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server or Postman
    if (!origin) return callback(null, true);

    // Allow localhost (dev only)
    const isLocalhost = origin.includes('localhost');

    // Allow all Vercel deployments
    const isVercel = origin.endsWith('.vercel.app');

    if (isLocalhost || isVercel) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// IMPORTANT: preflight must be handled correctly
app.options('*', cors(corsOptions));

/* =========================
   RATE LIMITING
========================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
    service: 'Smart Parking API',
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
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});