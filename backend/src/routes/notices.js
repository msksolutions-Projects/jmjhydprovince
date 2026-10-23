const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const Notice = require('../models/Notice');
const { asyncHandler, HttpError } = require('../middleware/errors');
const { pick, isId, statusFilter, clampLimit } = require('../utils/helpers');
const { cleanAttachments } = require('../models/attachment');
const { deleteFile } = require('../utils/storage');

const router = express.Router();
const EDITABLE = ['title', 'content', 'category', 'urgency', 'status', 'expiryDate', 'attachments'];

const findOr404 = async (id) => {
  if (!isId(id)) throw new HttpError(404, 'Notice not found.');
  const notice = await Notice.findById(id);
  if (!notice) throw new HttpError(404, 'Notice not found.');
  return notice;
};

// Visitors: published, not expired. Admins: any status ('' = all).
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const query = { ...statusFilter(req) };
  if (!req.admin) query.$or = [{ expiryDate: null }, { expiryDate: { $exists: false } }, { expiryDate: { $gte: new Date() } }];
  if (req.query.category) query.category = String(req.query.category);
  const notices = await Notice.find(query).sort({ publishedAt: -1, createdAt: -1 }).limit(clampLimit(req.query.limit, 50));
  res.json({ success: true, count: notices.length, data: notices });
}));

router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const notice = await findOr404(req.params.id);
  if (!req.admin && notice.status !== 'published') throw new HttpError(404, 'Notice not found.');
  res.json({ success: true, data: notice });
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  const body = pick(req.body, EDITABLE);
  if (body.attachments !== undefined) body.attachments = cleanAttachments(body.attachments);
  const notice = await Notice.create({ ...body, status: body.status || 'draft', author: req.admin._id });
  res.status(201).json({ success: true, message: 'Notice created', data: notice });
}));

const update = asyncHandler(async (req, res) => {
  const notice = await findOr404(req.params.id);
  const body = pick(req.body, EDITABLE);
  let dropped = [];
  if (body.attachments !== undefined) {
    body.attachments = cleanAttachments(body.attachments);
    const keep = new Set(body.attachments.map((a) => a.publicId).filter(Boolean));
    dropped = (notice.attachments || []).filter((a) => a.publicId && !keep.has(a.publicId));
  }
  Object.assign(notice, body);
  await notice.save();
  await Promise.all(dropped.map(deleteFile));
  res.json({ success: true, message: 'Notice updated', data: notice });
});
router.put('/:id', protect, update);
router.patch('/:id', protect, update);

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const notice = await findOr404(req.params.id);
  await notice.deleteOne();
  await Promise.all((notice.attachments || []).map(deleteFile));
  res.json({ success: true, message: 'Notice deleted' });
}));

module.exports = router;
