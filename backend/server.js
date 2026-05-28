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
import settingsRoutes from './routes/settingsRoutes.js';

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
   DB CONNECTION
========================= */
connectDB();

const app = express();

/* =========================
   CORS MIDDLEWARE (MUST BE FIRST)
========================= */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server, Postman, or local non-browser requests
    if (!origin) return callback(null, true);

    // Enforce environment validation: allow localhost/127.0.0.1 loopbacks ONLY in non-production mode
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isVercel = origin.endsWith('.vercel.app');

    const isAllowed = isVercel || (process.env.NODE_ENV !== 'production' && isLocalhost);

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // Asserts 200 OK status for legacy browser preflights
};

// Mount CORS middleware as the absolute first entry point in the pipeline
app.use(cors(corsOptions));

/* =========================
   SECURITY MIDDLEWARE
========================= */
app.use(helmet());
app.use(mongoSanitize());

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
   BODY PARSERS
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
app.use('/api', settingsRoutes);

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
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});