const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const ContactMessage = require('../models/ContactMessage');
const { notifyContact } = require('../utils/mailer');
const { asyncHandler, HttpError } = require('../middleware/errors');
const { isId, clampLimit } = require('../utils/helpers');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages have been sent. Please wait a few minutes and try again.' },
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[\d\s+()-]{6,20}$/;
const str = (v) => (typeof v === 'string' ? v.trim() : '');

/** Same rules as the website form (frontend contact.service.ts). */
function validate(body) {
  const v = {
    fullName: str(body.fullName),
    email: str(body.email).toLowerCase(),
    phone: str(body.phone),
    subject: str(body.subject),
    message: str(body.message),
  };
  const errors = {};
  if (v.fullName.length < 2) errors.fullName = 'Please enter your full name.';
  if (!EMAIL.test(v.email)) errors.email = 'Enter a valid email address.';
  if (v.phone && !PHONE.test(v.phone)) errors.phone = 'Enter a valid phone number.';
  if (v.subject.length < 3) errors.subject = 'Please add a short subject.';
  if (v.message.length < 20) errors.message = 'Please tell us a little more — at least 20 characters.';
  if (v.message.length > 5000) errors.message = 'Please keep the message under 5000 characters.';
  if (body.consent !== true && body.consent !== 'true') errors.consent = 'Please confirm before sending.';
  return { values: v, errors };
}

// Public: website contact form
router.post('/', contactLimiter, asyncHandler(async (req, res) => {
  // Hidden anti-spam field (honeypot). Browser autofill can fill it too, so the
  // message is never thrown away: it is stored and filed under "Spam" for review.
  const suspectedSpam = Boolean(str(req.body.hp_check) || str(req.body.website));

  const { values, errors } = validate(req.body || {});
  if (Object.keys(errors).length) {
    return res.status(400).json({ ok: false, success: false, message: Object.values(errors)[0], errors });
  }
  const reference = `JMJ-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const saved = await ContactMessage.create({ ...values, reference, suspectedSpam, status: suspectedSpam ? 'spam' : 'new' });

  if (suspectedSpam) return res.status(201).json({ ok: true, success: true, reference, message: 'Message received' });

  try {
    const result = await notifyContact(saved);
    if (result.sent) await ContactMessage.updateOne({ _id: saved._id }, { emailed: true });
  } catch (err) {
    console.error('Contact email failed (message is still saved):', err.message);
  }
  res.status(201).json({ ok: true, success: true, reference, message: 'Message received' });
}));

// Admin: inbox
router.get('/', protect, asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status && req.query.status !== 'all') query.status = String(req.query.status);
  if (req.query.since) {
    const since = new Date(String(req.query.since));
    if (!Number.isNaN(since.getTime())) query.createdAt = { $gt: since };
  }
  const [items, unread] = await Promise.all([
    ContactMessage.find(query).sort({ createdAt: -1 }).limit(clampLimit(req.query.limit, 200, 500)),
    ContactMessage.countDocuments({ status: 'new' }),
  ]);
  res.json({ success: true, count: items.length, unread, data: items });
}));

const findOr404 = async (id) => {
  if (!isId(id)) throw new HttpError(404, 'Message not found.');
  const item = await ContactMessage.findById(id);
  if (!item) throw new HttpError(404, 'Message not found.');
  return item;
};

router.get('/:id', protect, asyncHandler(async (req, res) => {
  res.json({ success: true, data: await findOr404(req.params.id) });
}));

const setStatus = asyncHandler(async (req, res) => {
  const item = await findOr404(req.params.id);
  item.status = req.body.status;
  await item.save();
  res.json({ success: true, message: 'Message updated', data: item });
});
router.patch('/:id', protect, setStatus);
router.put('/:id', protect, setStatus);

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const item = await findOr404(req.params.id);
  await item.deleteOne();
  res.json({ success: true, message: 'Message deleted' });
}));

module.exports = router;
