const multer = require('multer');
const { HttpError } = require('./errors');

const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new HttpError(400, 'Only image files are allowed (JPG, PNG, WebP or GIF).')),
});

/** Attachments for news and notices: documents and photos. */
const DOCUMENT_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'text/plain': '.txt',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const uploadFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    DOCUMENT_TYPES[file.mimetype]
      ? cb(null, true)
      : cb(new HttpError(400, 'This file type is not allowed. Upload a PDF, Word, Excel, PowerPoint, text file or photo.')),
});

module.exports = upload;
module.exports.uploadFile = uploadFile;
module.exports.DOCUMENT_TYPES = DOCUMENT_TYPES;
