const mongoose = require('mongoose');
const config = require('./config');
const app = require('./app');

mongoose.set('strictQuery', true);

async function start() {
  if (!config.mongoUri || config.isPlaceholder(config.mongoUri) || /username:password@cluster/.test(config.mongoUri)) {
    console.error('❌ MONGODB_URI is not set. Add your MongoDB connection string to backend/.env');
    process.exit(1);
  }
  if (config.jwtSecretGenerated) {
    console.warn('⚠️  JWT_SECRET is not set: using a temporary secret (logins reset on restart). Set JWT_SECRET in .env.');
  }

  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Check MONGODB_URI, your internet connection, and the Atlas IP access list (Network Access).');
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`🚀 API running on http://localhost:${config.port}  (${config.env})`);
    console.log(`   Images: ${config.cloudinaryConfigured ? 'Cloudinary' : 'local uploads/ folder'} · Email: ${config.smtpConfigured ? 'SMTP enabled' : 'off (messages are saved in the admin inbox)'}`);
    console.log(`   CORS allowed: ${config.corsOrigins.join(', ')}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down…`);
    server.close(() => mongoose.connection.close(false).then(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));

start();
