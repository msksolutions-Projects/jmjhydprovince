const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  // Public gallery album: an existing album id (e.g. "youth-fest-2025") or a new album name
  album: {
    type: String,
    trim: true,
    maxlength: [80, 'Album name cannot exceed 80 characters'],
    default: ''
  },
  category: {
    type: String,
    enum: [
      'formation',
      'education',
      'healthcare',
      'social-services',
      'events',
      'celebrations',
      'pilgrimages',
      'meetings',
      'other'
    ],
    default: 'events'
  },
  coverImage: {
    url: String,
    thumbUrl: String,
    publicId: String,
    width: Number,
    height: Number
  },
  images: [{
    url: String,
    thumbUrl: String,
    publicId: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  eventDate: {
    type: Date,
    required: false
  },
  location: {
    type: String,
    trim: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  seoTitle: {
    type: String,
    maxlength: [70, 'SEO title cannot exceed 70 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  }
}, { timestamps: true });

// Slug fallback (routes set a unique slug before saving)
gallerySchema.pre('save', function(next) {
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
gallerySchema.index({ category: 1 });
gallerySchema.index({ status: 1 });
gallerySchema.index({ publishedAt: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);
