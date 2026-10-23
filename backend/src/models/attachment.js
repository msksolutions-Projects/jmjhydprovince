const mongoose = require('mongoose');

/** A file attached to a news article or notice. */
const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 160 },
    url: { type: String, required: true },
    thumbUrl: String,
    // `type` must be wrapped, otherwise Mongoose reads it as the field type
    type: { type: String },
    kind: { type: String, enum: ['image', 'pdf', 'document'], default: 'document' },
    size: Number,
    publicId: String,
    resourceType: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const MAX_ATTACHMENTS = 10;

/** Keeps only valid attachment records sent by the admin form. */
function cleanAttachments(value) {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((a) => a && typeof a.url === 'string' && /^(https?:\/\/|\/uploads\/)/.test(a.url))
    .slice(0, MAX_ATTACHMENTS)
    .map((a) => ({
      name: String(a.name || 'file').slice(0, 160),
      url: a.url,
      thumbUrl: typeof a.thumbUrl === 'string' && /^(https?:\/\/|\/uploads\/)/.test(a.thumbUrl) ? a.thumbUrl : undefined,
      type: typeof a.type === 'string' ? a.type.slice(0, 120) : undefined,
      kind: ['image', 'pdf', 'document'].includes(a.kind) ? a.kind : 'document',
      size: Number.isFinite(Number(a.size)) ? Number(a.size) : undefined,
      publicId: typeof a.publicId === 'string' ? a.publicId : undefined,
      resourceType: typeof a.resourceType === 'string' ? a.resourceType : undefined,
      uploadedAt: a.uploadedAt ? new Date(a.uploadedAt) : new Date(),
    }));
}

module.exports = { attachmentSchema, cleanAttachments, MAX_ATTACHMENTS };
