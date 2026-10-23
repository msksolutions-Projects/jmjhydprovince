const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200, match: [/.+@.+\..+/, 'Enter a valid email address.'] },
    phone: { type: String, trim: true, maxlength: 30 },
    subject: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    message: { type: String, required: true, trim: true, minlength: 20, maxlength: 5000 },
    status: { type: String, enum: ['new', 'read', 'replied', 'archived', 'spam'], default: 'new' },
    // Set when the hidden anti-spam field was filled (bots, or browser autofill). Never discarded.
    suspectedSpam: { type: Boolean, default: false },
    emailed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

contactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
