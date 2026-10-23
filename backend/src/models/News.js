const mongoose = require('mongoose');
const { attachmentSchema } = require('./attachment');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: [true, 'Please provide an excerpt'],
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    minlength: [100, 'Content must be at least 100 characters']
  },
  category: {
    type: String,
    enum: [
      'announcements',
      'celebrations',
      'education',
      'healthcare',
      'social-services',
      'formation',
      'environment',
      'events',
      'bicentenary',
      'other'
    ],
    default: 'announcements'
  },
  image: {
    type: String,
    required: false
  },
  attachments: [attachmentSchema],
  featured: {
    type: Boolean,
    default: false
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
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  seoTitle: {
    type: String,
    maxlength: [70, 'SEO title cannot exceed 70 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  seoKeywords: [String]
}, { timestamps: true });

// Slug fallback (routes set a unique slug before saving)
newsSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Indexes (slug is already indexed by `unique: true`)
newsSchema.index({ category: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('News', newsSchema);
