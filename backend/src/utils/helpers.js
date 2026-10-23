const mongoose = require('mongoose');

/** Copy only the listed fields that are present in the request body. */
const pick = (source, fields) =>
  fields.reduce((out, key) => {
    if (source && source[key] !== undefined) out[key] = source[key];
    return out;
  }, {});

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';

/** A slug that is unique within the model's collection. */
async function uniqueSlug(Model, title, excludeId) {
  const base = slugify(title);
  let slug = base;
  for (let n = 2; n < 500; n += 1) {
    // eslint-disable-next-line no-await-in-loop
    const clash = await Model.exists({ slug, ...(excludeId && { _id: { $ne: excludeId } }) });
    if (!clash) return slug;
    slug = `${base}-${n}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

const isId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

/** Status filter: visitors only ever see published items; admins can ask for any status ('' = all). */
function statusFilter(req) {
  if (!req.admin) return { status: 'published' };
  const { status } = req.query;
  if (status === undefined) return { status: 'published' };
  if (status === '' || status === 'all') return {};
  return { status };
}

const clampLimit = (value, fallback, max = 200) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
};

module.exports = { pick, slugify, uniqueSlug, isId, statusFilter, clampLimit };
