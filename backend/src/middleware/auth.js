const { verifyToken } = require('../utils/jwt');
const Admin = require('../models/Admin');

const readToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

/** Require a valid admin token. */
const protect = async (req, res, next) => {
  const token = readToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Please log in to continue.' });
  }
  try {
    const decoded = verifyToken(token);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ success: false, message: 'Admin account not found.' });
    if (!admin.isActive) return res.status(403).json({ success: false, message: 'Admin account is inactive.' });
    req.admin = admin;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Your session has expired. Please log in again.' });
  }
};

/** Attach req.admin when a valid token is sent; never blocks the request. */
const optionalAuth = async (req, res, next) => {
  const token = readToken(req);
  if (!token) return next();
  try {
    const decoded = verifyToken(token);
    const admin = await Admin.findById(decoded.id);
    if (admin && admin.isActive) req.admin = admin;
  } catch {
    // ignore: treated as a public visitor
  }
  return next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to do this.' });
  }
  return next();
};

module.exports = { protect, optionalAuth, authorize };
