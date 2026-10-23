const mongoose = require('mongoose');
const { attachmentSchema } = require('./attachment');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    minlength: [50, 'Content must be at least 50 characters']
  },
  category: {
    type: String,
    enum: [
      'general',
      'holiday',
      'event',
      'meeting',
      'urgent',
      'maintenance',
      'academic',
      'administrative'
    ],
    default: 'general'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  expiryDate: {
    type: Date,
    required: false
  },
  attachments: [attachmentSchema],
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Set publishedAt when status changes to published
noticeSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Create indexes for better query performance
noticeSchema.index({ status: 1 });
noticeSchema.index({ urgency: 1 });
noticeSchema.index({ publishedAt: -1 });
noticeSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
