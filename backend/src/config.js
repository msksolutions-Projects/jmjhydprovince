const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/** Values copied from .env.example that were never filled in. */
const isPlaceholder = (value) =>
  !value || /^your[_-]|change_in_production|_here$|^initial_password/i.test(String(value).trim());

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

let jwtSecret = process.env.JWT_SECRET;
let jwtSecretGenerated = false;
if (isPlaceholder(jwtSecret) || String(jwtSecret).length < 32) {
  if (isProd) {
    throw new Error('JWT_SECRET is missing or still the example value. Set a long random JWT_SECRET in .env before starting in production.');
  }
  // Development only: a temporary secret (logins reset when the server restarts).
  jwtSecret = crypto.randomBytes(48).toString('hex');
  jwtSecretGenerated = true;
}

const list = (value) => String(value || '').split(',').map((s) => s.trim()).filter(Boolean);

const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'https://jmjprovincehyd.vercel.app',
  'https://jmjprovincehyd.onrender.com',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PROD,
  ...list(process.env.CORS_ORIGINS),
].filter((o) => o && !isPlaceholder(o));

const cloudinaryConfigured = ['CLOUDINARY_NAME', 'CLOUDINARY_KEY', 'CLOUDINARY_SECRET'].every(
  (k) => !isPlaceholder(process.env[k]),
);

const smtpConfigured = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'].every((k) => !isPlaceholder(process.env[k]));

module.exports = {
  env,
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret,
  jwtSecretGenerated,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  corsOrigins: [...new Set(corsOrigins)],
  cloudinaryConfigured,
  smtpConfigured,
  contactTo: process.env.CONTACT_TO || (isPlaceholder(process.env.ADMIN_EMAIL) ? null : process.env.ADMIN_EMAIL),
  uploadsDir: path.resolve(__dirname, '../uploads'),
  frontendDist: process.env.FRONTEND_DIST
    ? path.resolve(process.env.FRONTEND_DIST)
    : path.resolve(__dirname, '../../frontend/dist'),
  isPlaceholder,
};
