const multer = require('multer');

/** Wraps an async route so rejected promises reach the error handler. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';
  let errors;

  if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(' ');
  } else if (err.name === 'CastError') {
    status = 404;
    message = 'Item not found.';
  } else if (err.code === 11000) {
    status = 409;
    message = 'An item with the same unique value already exists.';
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'The file is too large (photos up to 10 MB, attachments up to 15 MB).' : err.message;
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'The request is too large.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'The request body is not valid JSON.';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Your session has expired. Please log in again.';
  }

  if (status >= 500) console.error('Unhandled error:', err);

  res.status(status).json({
    success: false,
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    ...(errors && { errors }),
  });
};

module.exports = { asyncHandler, HttpError, notFound, errorHandler };
