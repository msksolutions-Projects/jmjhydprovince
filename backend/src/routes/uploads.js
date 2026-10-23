const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadFile } = require('../middleware/upload');
const { saveFile, deleteFile } = require('../utils/storage');
const { asyncHandler, HttpError } = require('../middleware/errors');
const News = require('../models/News');
const Notice = require('../models/Notice');

const router = express.Router();

// Upload one attachment (multipart field "file"); the admin form then saves it with the article/notice.
router.post('/', protect, uploadFile.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Please choose a file to upload.');
  const attachment = await saveFile(req.file, req);
  res.status(201).json({ success: true, message: 'File uploaded', data: attachment });
}));

// Remove an uploaded file that was never saved (e.g. the editor was cancelled).
router.delete('/', protect, asyncHandler(async (req, res) => {
  const publicId = String(req.body?.publicId || '');
  if (!publicId) throw new HttpError(400, 'Missing file id.');
  const inUse = await Promise.all([
    News.exists({ 'attachments.publicId': publicId }),
    Notice.exists({ 'attachments.publicId': publicId }),
  ]);
  if (inUse.some(Boolean)) throw new HttpError(409, 'This file is attached to a saved item. Remove it from that item instead.');
  await deleteFile({ publicId, resourceType: req.body?.resourceType });
  res.json({ success: true, message: 'File removed' });
}));

module.exports = router;
