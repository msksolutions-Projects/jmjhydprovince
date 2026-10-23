const News = require('../models/News');
const { asyncHandler, HttpError } = require('../middleware/errors');
const { pick, uniqueSlug, isId, statusFilter, clampLimit } = require('../utils/helpers');
const { cleanAttachments } = require('../models/attachment');
const { deleteFile } = require('../utils/storage');

const EDITABLE = ['title', 'excerpt', 'content', 'category', 'image', 'featured', 'status', 'seoTitle', 'seoDescription', 'seoKeywords', 'attachments'];

/** Files dropped from an item when it is edited are deleted from storage. */
const removedFiles = (before = [], after = []) => {
  const keep = new Set(after.map((a) => a.publicId).filter(Boolean));
  return before.filter((a) => a.publicId && !keep.has(a.publicId));
};
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findOr404 = async (id) => {
  if (!isId(id)) throw new HttpError(404, 'News article not found.');
  const item = await News.findById(id);
  if (!item) throw new HttpError(404, 'News article not found.');
  return item;
};

// GET /news — visitors get published articles; admins may pass status ('' = all)
exports.getNews = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const page = clampLimit(req.query.page, 1, 10000);
  const limit = clampLimit(req.query.limit, 10, 200);
  const query = { ...statusFilter(req) };
  if (category) query.category = String(category);
  if (search) {
    const rx = { $regex: escapeRegex(search), $options: 'i' };
    query.$or = [{ title: rx }, { excerpt: rx }, { content: rx }];
  }
  const [news, total] = await Promise.all([
    News.find(query).populate('author', 'name').sort({ publishedAt: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    News.countDocuments(query),
  ]);
  res.json({ success: true, count: news.length, total, pages: Math.ceil(total / limit), data: news });
});

// GET /news/:idOrSlug
exports.getSingleNews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = isId(id) ? await News.findById(id).populate('author', 'name') : await News.findOne({ slug: id }).populate('author', 'name');
  if (!item || (!req.admin && item.status !== 'published')) throw new HttpError(404, 'News article not found.');
  if (!req.admin) await News.updateOne({ _id: item._id }, { $inc: { views: 1 } });
  res.json({ success: true, data: item });
});

exports.createNews = asyncHandler(async (req, res) => {
  const body = pick(req.body, EDITABLE);
  if (body.attachments !== undefined) body.attachments = cleanAttachments(body.attachments);
  if (!body.title || !body.excerpt || !body.content) throw new HttpError(400, 'Please provide a title, summary and article text.');
  const news = new News({ ...body, status: body.status || 'draft', author: req.admin._id });
  news.slug = await uniqueSlug(News, news.title);
  await news.save();
  res.status(201).json({ success: true, message: 'News created successfully', data: news });
});

exports.updateNews = asyncHandler(async (req, res) => {
  const news = await findOr404(req.params.id);
  const body = pick(req.body, EDITABLE);
  let dropped = [];
  if (body.attachments !== undefined) {
    body.attachments = cleanAttachments(body.attachments);
    dropped = removedFiles(news.attachments, body.attachments);
  }
  Object.assign(news, body);
  if (body.title !== undefined && news.isModified('title')) news.slug = await uniqueSlug(News, news.title, news._id);
  await news.save();
  await Promise.all(dropped.map(deleteFile));
  res.json({ success: true, message: 'News updated successfully', data: news });
});

exports.deleteNews = asyncHandler(async (req, res) => {
  const news = await findOr404(req.params.id);
  await news.deleteOne();
  await Promise.all((news.attachments || []).map(deleteFile));
  res.json({ success: true, message: 'News deleted successfully' });
});

exports.getFeaturedNews = asyncHandler(async (req, res) => {
  const news = await News.find({ featured: true, status: 'published' }).populate('author', 'name').sort({ publishedAt: -1 }).limit(5);
  res.json({ success: true, count: news.length, data: news });
});

exports.searchNews = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) throw new HttpError(400, 'Please provide a search query.');
  const rx = { $regex: escapeRegex(q), $options: 'i' };
  const news = await News.find({ $or: [{ title: rx }, { excerpt: rx }, { content: rx }], status: 'published' }).populate('author', 'name').limit(20);
  res.json({ success: true, count: news.length, data: news });
});
