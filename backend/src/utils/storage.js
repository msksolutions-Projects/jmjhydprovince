const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const config = require('../config');
const cloud = require('./cloudinary');
const { HttpError } = require('../middleware/errors');

/**
 * Makes a fast web version (max 1600 px, WebP) and a 600×450 thumbnail of an
 * uploaded photo. Phone photos of 5–10 MB become ~150–300 KB.
 */
async function optimise(buffer) {
  try {
    const base = sharp(buffer, { failOn: 'error' }).rotate(); // apply phone EXIF orientation
    const large = await base.clone().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
    const thumb = await base.clone().resize({ width: 600, height: 450, fit: 'cover', position: 'attention' }).webp({ quality: 72 }).toBuffer();
    return { large: large.data, width: large.info.width, height: large.info.height, thumb };
  } catch {
    throw new HttpError(400, 'This image could not be read. Please upload a JPG, PNG or WebP photo.');
  }
}

/**
 * Stores an uploaded image. Uses Cloudinary when its keys are set in .env;
 * otherwise saves to backend/uploads/ (served at /uploads).
 * Returns { url, thumbUrl, publicId, width, height }.
 */
async function saveImage(file, req) {
  const img = await optimise(file.buffer);

  if (config.cloudinaryConfigured) {
    const result = await cloud.uploadBuffer(img.large, 'jmj-gallery');
    const thumbUrl = result.secure_url.replace('/upload/', '/upload/c_fill,g_auto,w_600,h_450,q_auto,f_auto/');
    return { url: result.secure_url, thumbUrl, publicId: result.public_id, width: img.width, height: img.height };
  }

  await fs.mkdir(config.uploadsDir, { recursive: true });
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}`;
  await fs.writeFile(path.join(config.uploadsDir, `${name}.webp`), img.large);
  await fs.writeFile(path.join(config.uploadsDir, `${name}-thumb.webp`), img.thumb);
  const base = (process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  return {
    url: `${base}/uploads/${name}.webp`,
    thumbUrl: `${base}/uploads/${name}-thumb.webp`,
    publicId: `local:${name}`,
    width: img.width,
    height: img.height,
  };
}

async function deleteImage(publicId) {
  if (!publicId) return;
  if (publicId.startsWith('local:')) {
    const name = path.basename(publicId.slice(6)).replace(/\.\w+$/, '');
    // Current uploads (.webp + thumbnail) and older ones saved with their original extension
    const files = await fs.readdir(config.uploadsDir).catch(() => []);
    await Promise.all(
      files.filter((f) => f === `${name}-thumb.webp` || f.replace(/\.\w+$/, '') === name).map((f) => fs.unlink(path.join(config.uploadsDir, f)).catch(() => {})),
    );
    return;
  }
  await cloud.deleteImage(publicId);
}

const MAX_NAME = 120;
const cleanName = (name) =>
  String(name || 'file')
    .normalize('NFKD')
    .replace(/[^\w.\- ()]+/g, '_')
    .replace(/_+/g, '_')
    .slice(-MAX_NAME) || 'file';

/**
 * Stores a news/notice attachment. Photos are optimised like gallery uploads;
 * documents are stored unchanged. Returns the attachment record.
 */
async function saveFile(file, req) {
  const { DOCUMENT_TYPES } = require('../middleware/upload');
  const name = cleanName(file.originalname);
  if (file.mimetype.startsWith('image/')) {
    const img = await saveImage(file, req);
    return { name, url: img.url, thumbUrl: img.thumbUrl, type: 'image/webp', kind: 'image', size: file.size, publicId: img.publicId, resourceType: 'image' };
  }
  const ext = DOCUMENT_TYPES[file.mimetype] || '';
  const kind = file.mimetype === 'application/pdf' ? 'pdf' : 'document';

  if (config.cloudinaryConfigured) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloud.cloudinary.uploader.upload_stream(
        { folder: 'jmj-attachments', resource_type: 'raw', public_id: `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}${ext}` },
        (error, res) => (error ? reject(error) : resolve(res)),
      );
      stream.end(file.buffer);
    });
    return { name, url: result.secure_url, type: file.mimetype, kind, size: file.size, publicId: result.public_id, resourceType: 'raw' };
  }

  await fs.mkdir(config.uploadsDir, { recursive: true });
  const stem = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}`;
  await fs.writeFile(path.join(config.uploadsDir, `${stem}${ext}`), file.buffer);
  const base = (process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  return { name, url: `${base}/uploads/${stem}${ext}`, type: file.mimetype, kind, size: file.size, publicId: `local:${stem}`, resourceType: 'local' };
}

/** Removes a stored attachment (local file or Cloudinary asset). */
async function deleteFile(attachment) {
  if (!attachment || !attachment.publicId) return;
  if (attachment.publicId.startsWith('local:')) return deleteImage(attachment.publicId);
  if (attachment.resourceType === 'raw') {
    try {
      await cloud.cloudinary.uploader.destroy(attachment.publicId, { resource_type: 'raw' });
    } catch (err) {
      console.error('Cloudinary delete failed:', err.message);
    }
    return;
  }
  return deleteImage(attachment.publicId);
}

module.exports = { saveImage, deleteImage, saveFile, deleteFile };
