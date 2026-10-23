const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { saveImage, deleteImage } = require('../utils/storage');
const Gallery = require('../models/Gallery');
const { asyncHandler, HttpError } = require('../middleware/errors');
const { pick, uniqueSlug, isId, statusFilter, clampLimit } = require('../utils/helpers');

const router = express.Router();
const EDITABLE = ['title', 'description', 'album', 'category', 'status', 'eventDate', 'location', 'featured'];

const findOr404 = async (id) => {
  if (!isId(id)) throw new HttpError(404, 'Photo not found.');
  const item = await Gallery.findById(id);
  if (!item) throw new HttpError(404, 'Photo not found.');
  return item;
};

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const query = { ...statusFilter(req) };
  if (req.query.category) query.category = String(req.query.category);
  const items = await Gallery.find(query).sort({ createdAt: -1 }).limit(clampLimit(req.query.limit, 200, 500));
  res.json({ success: true, count: items.length, data: items });
}));

router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const item = await findOr404(req.params.id);
  if (!req.admin && item.status !== 'published') throw new HttpError(404, 'Photo not found.');
  res.json({ success: true, data: item });
}));

// Upload one photo (multipart field "image")
router.post('/', protect, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Please choose an image to upload.');
  const body = pick(req.body, EDITABLE);
  const item = new Gallery({
    ...body,
    title: (body.title || req.file.originalname || 'Gallery photo').trim(),
    category: body.category || 'events',
    status: body.status || 'published',
    author: req.admin._id,
  });
  await item.validate(); // fail fast before storing the file
  const stored = await saveImage(req.file, req);
  item.coverImage = { url: stored.url, thumbUrl: stored.thumbUrl, publicId: stored.publicId, width: stored.width, height: stored.height };
  item.images = [{ url: stored.url, thumbUrl: stored.thumbUrl, publicId: stored.publicId, caption: item.title }];
  item.slug = await uniqueSlug(Gallery, item.title);
  try {
    await item.save();
  } catch (err) {
    await deleteImage(stored.publicId);
    throw err;
  }
  res.status(201).json({ success: true, message: 'Photo uploaded', data: item });
}));

const update = asyncHandler(async (req, res) => {
  const item = await findOr404(req.params.id);
  Object.assign(item, pick(req.body, EDITABLE));
  if (item.isModified('title')) item.slug = await uniqueSlug(Gallery, item.title, item._id);
  await item.save();
  res.json({ success: true, message: 'Photo updated', data: item });
});
router.put('/:id', protect, update);
router.patch('/:id', protect, update);

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const item = await findOr404(req.params.id);
  const ids = new Set([item.coverImage?.publicId, ...(item.images || []).map((i) => i.publicId)].filter(Boolean));
  await Promise.all([...ids].map(deleteImage));
  await item.deleteOne();
  res.json({ success: true, message: 'Photo deleted' });
}));

module.exports = router;
