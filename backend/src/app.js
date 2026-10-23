const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errors');

const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const noticeRoutes = require('./routes/notices');
const galleryRoutes = require('./routes/gallery');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');

const app = express();

// Behind Render / Railway / Nginx: trust the first proxy for HTTPS and client IPs.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // let the website show /uploads images
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", 'https://www.googletagmanager.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://*.google-analytics.com', 'https://*.googletagmanager.com'],
        'connect-src': ["'self'", 'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com', ...config.corsOrigins],
        'frame-src': ["'self'", 'https://www.google.com', 'https://maps.google.com'],
        // Not forced here: on a plain-HTTP server it would block every asset. HTTPS comes from the host.
        'upgrade-insecure-requests': null,
      },
    },
    hsts: config.isProd ? { maxAge: 15552000, includeSubDomains: true } : false,
  }),
);

app.use(
  cors({
    origin(origin, cb) {
      // Same-origin requests and tools like curl send no Origin header.
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'test') app.use(morgan(config.isProd ? 'combined' : 'dev'));

// Rate limits
const json429 = (message) => ({ success: false, message });
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false, message: json429('Too many requests. Please try again in a few minutes.') }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: json429('Too many login attempts. Please wait 15 minutes and try again.') });
app.use(['/api/v1/auth/login', '/api/v1/auth/register'], authLimiter);

// Health checks (both paths, the README documents /api/health)
const health = (req, res) =>
  res.json({
    status: 'OK',
    message: 'JMJ Hyderabad Backend is running',
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
    imageStorage: config.cloudinaryConfigured ? 'cloudinary' : 'local',
    email: config.smtpConfigured ? 'enabled' : 'disabled',
    timestamp: new Date().toISOString(),
  });
app.get(['/api/health', '/api/v1/health'], health);

// API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api', notFound);

// Locally stored uploads (used when Cloudinary is not configured)
app.use('/uploads', express.static(config.uploadsDir, { maxAge: '30d', fallthrough: false }));

// Serve the built website (frontend/dist) from the same server when it exists.
if (fs.existsSync(path.join(config.frontendDist, 'index.html'))) {
  app.use(
    express.static(config.frontendDist, {
      index: false,
      setHeaders(res, file) {
        if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
    }),
  );
  app.get('*', (req, res) => res.sendFile(path.join(config.frontendDist, 'index.html')));
} else {
  app.get('/', (req, res) => res.json({ success: true, message: 'JMJ Hyderabad API. Build the frontend (npm run build in /frontend) to serve the website from here.' }));
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
