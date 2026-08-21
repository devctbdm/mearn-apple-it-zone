import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
// Import route files (with .js extension)
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import sliderRoutes from './routes/sliderRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import paymentSettingsRoutes from './routes/paymentSettingsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import smsRoutes from './routes/smsRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import homeSliderTextRoutes from './routes/homeSliderTextRoutes.js';

// Set DNS servers to avoid DNS resolution issues
import { setServers } from 'node:dns/promises';
setServers(['8.8.8.8', '1.1.1.1', '9.9.9.9']);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Disable ETag so cached API responses don't come back as 304 (breaks axios validateStatus)
app.set('etag', false);

// ------- Middlewares -------

// 1. Security headers
app.use(helmet());

// 2. CORS (allow frontend and mobile apps)
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Never cache API responses (auth data must stay fresh; avoids 304 breaking axios)
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// 3. Rate limiting (prevent brute force)
// General API limit: generous for a storefront (products, categories, cart, user, etc.)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Stricter limiter for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 login/register attempts per windowMs per IP
  message: 'Too many login attempts from this IP, please try again later.',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);

// 4. Logging (dev format)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 5. Compression (gzip)
app.use(compression());

// 6. Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ------- Routes -------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/store', storeRoutes);

app.use('/api/reviews', reviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment-settings', paymentSettingsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/holiday', holidayRoutes);
app.use('/api/home-slider-texts', homeSliderTextRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Apple IT Zone backend is running' });
});

// ------- Error Handling Middleware -------
app.use((err, req, res, _next) => {
  console.error('❌ Error:', err.stack);

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors,
    });
  }

  // Duplicate key error (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Default to 500
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Catch 404 and forward to error handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
