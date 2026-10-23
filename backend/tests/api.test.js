/**
 * End-to-end API tests. Needs a throwaway database:
 *   MONGODB_URI_TEST=mongodb://127.0.0.1:27017/jmj_test npm test
 * The test database is wiped at the start of the run. Skipped when not set.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

const URI = process.env.MONGODB_URI_TEST;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET_TEST || 'test-secret-'.padEnd(64, 'x');
process.env.CLOUDINARY_NAME = '';

let base;
let server;
let mongoose;
let token;

const api = async (method, path, { body, auth = true, form } = {}) => {
  const headers = {};
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${base}${path}`, { method, headers, body: payload });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json };
};

const long = (n, ch = 'x') => ch.repeat(n);

before(async () => {
  if (!URI) return;
  mongoose = require('mongoose');
  await mongoose.connect(URI);
  await mongoose.connection.dropDatabase();
  const app = require('../src/app');
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});

after(async () => {
  if (server) server.close();
  if (mongoose) await mongoose.disconnect();
});

const t = (name, fn) => test(name, { skip: !URI && 'set MONGODB_URI_TEST to run API tests' }, fn);

t('health check on both paths', async () => {
  assert.equal((await api('GET', '/health')).status, 200);
  const r = await fetch(base.replace('/v1', '') + '/health');
  assert.equal(r.status, 200);
});

t('registers the first admin only, then logs in', async () => {
  const bad = await api('POST', '/auth/register', { body: { name: 'A', email: 'nope', password: 'short' } });
  assert.equal(bad.status, 400);
  const reg = await api('POST', '/auth/register', { body: { name: 'Sr. Test Admin', email: 'Admin@Test.org', password: 'Password123!' } });
  assert.equal(reg.status, 201);
  const again = await api('POST', '/auth/register', { body: { name: 'Second', email: 'x@y.org', password: 'Password123!' } });
  assert.equal(again.status, 403);
  const wrong = await api('POST', '/auth/login', { body: { email: 'admin@test.org', password: 'nope-nope' } });
  assert.equal(wrong.status, 401);
  const login = await api('POST', '/auth/login', { body: { email: 'ADMIN@test.org ', password: 'Password123!' } });
  assert.equal(login.status, 200);
  token = login.body.token;
  const verify = await api('GET', '/auth/verify');
  assert.equal(verify.body.admin.email, 'admin@test.org');
});

t('protected routes reject missing or bad tokens', async () => {
  const saved = token;
  token = 'garbage';
  assert.equal((await api('POST', '/news', { body: {} })).status, 401);
  token = undefined;
  assert.equal((await api('GET', '/contact')).status, 401);
  token = saved;
});

t('news CRUD with validation, unique slugs and draft privacy', async () => {
  const short = await api('POST', '/news', { body: { title: 'Hi', excerpt: 'e', content: long(120) } });
  assert.equal(short.status, 400);
  assert.match(short.body.message, /at least 5/);

  const a = await api('POST', '/news', { body: { title: 'Feast day news', excerpt: 'Summary', content: long(120), status: 'published' } });
  const b = await api('POST', '/news', { body: { title: 'Feast day news', excerpt: 'Summary', content: long(120), status: 'draft', views: 999 } });
  assert.equal(a.status, 201);
  assert.equal(b.status, 201, 'duplicate titles must not crash');
  assert.notEqual(a.body.data.slug, b.body.data.slug);
  assert.equal(b.body.data.views, 0, 'views cannot be set by the client');

  const pub = await api('GET', '/news?status=', { auth: false });
  assert.equal(pub.body.data.length, 1, 'visitors only see published');
  const all = await api('GET', '/news?status=&limit=100');
  assert.equal(all.body.data.length, 2, 'admins can list drafts');
  assert.equal((await api('GET', `/news/${b.body.data._id}`, { auth: false })).status, 404, 'draft hidden from visitors');
  assert.equal((await api('GET', `/news/${a.body.data.slug}`, { auth: false })).status, 200, 'lookup by slug');

  const upd = await api('PUT', `/news/${b.body.data._id}`, { body: { status: 'published', author: '000000000000000000000000' } });
  assert.equal(upd.status, 200);
  assert.ok(upd.body.data.publishedAt);
  assert.notEqual(String(upd.body.data.author), '000000000000000000000000');

  assert.equal((await api('GET', '/news/not-an-id-or-slug', { auth: false })).status, 404);
  assert.equal((await api('PUT', '/news/123', { body: {} })).status, 404);
  assert.equal((await api('DELETE', `/news/${a.body.data._id}`)).status, 200);
  assert.equal((await api('DELETE', `/news/${a.body.data._id}`)).status, 404);
});

t('notices CRUD, attachments and expiry', async () => {
  const bad = await api('POST', '/notices', { body: { title: 'Office', content: 'too short' } });
  assert.equal(bad.status, 400);
  const n = await api('POST', '/notices', { body: { title: 'Office closed Monday', content: long(60), urgency: 'high', status: 'published', attachments: [{ name: 'Circular', url: 'https://example.org/a.pdf', type: 'pdf' }] } });
  assert.equal(n.status, 201);
  assert.equal(n.body.data.attachments[0].type, 'pdf');
  await api('POST', '/notices', { body: { title: 'Expired notice text', content: long(60), status: 'published', expiryDate: '2020-01-01' } });
  const pub = await api('GET', '/notices', { auth: false });
  assert.equal(pub.body.data.length, 1, 'expired notices hidden from visitors');
  const bogus = await api('PUT', `/notices/${n.body.data._id}`, { body: { urgency: 'extreme' } });
  assert.equal(bogus.status, 400);
  assert.equal((await api('DELETE', `/notices/${n.body.data._id}`)).status, 200);
});

t('gallery upload stores locally without Cloudinary, edit and delete', async () => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const form = new FormData();
  form.append('image', new Blob([png], { type: 'image/png' }), 'dot.png');
  form.append('title', 'Province gathering 2026');
  form.append('category', 'events');
  form.append('album', 'youth-fest-2025');
  const up = await api('POST', '/gallery', { form });
  assert.equal(up.status, 201, JSON.stringify(up.body));
  const img = await fetch(up.body.data.coverImage.url);
  assert.equal(img.status, 200);
  assert.equal(img.headers.get('content-type'), 'image/webp', 'optimised to WebP');
  assert.equal((await fetch(up.body.data.coverImage.thumbUrl)).status, 200, 'thumbnail created');
  assert.equal(up.body.data.album, 'youth-fest-2025', 'album saved');

  const big = await require('sharp')({ create: { width: 4000, height: 3000, channels: 3, background: '#2c83be' } }).jpeg({ quality: 95 }).toBuffer();
  const bigForm = new FormData();
  bigForm.append('image', new Blob([big], { type: 'image/jpeg' }), 'phone.jpg');
  bigForm.append('title', 'Large phone photo upload');
  const bigUp = await api('POST', '/gallery', { form: bigForm });
  assert.equal(bigUp.status, 201);
  assert.equal(bigUp.body.data.coverImage.width, 1600, 'resized to 1600 px');
  await api('DELETE', `/gallery/${bigUp.body.data._id}`);

  const fake = new FormData();
  fake.append('image', new Blob([Buffer.from('not really a png')], { type: 'image/png' }), 'fake.png');
  fake.append('title', 'Corrupt image file');
  assert.equal((await api('POST', '/gallery', { form: fake })).status, 400, 'unreadable image rejected');

  const txt = new FormData();
  txt.append('image', new Blob(['hello'], { type: 'text/plain' }), 'a.txt');
  txt.append('title', 'Not an image file');
  assert.equal((await api('POST', '/gallery', { form: txt })).status, 400);

  const none = new FormData();
  none.append('title', 'Missing image here');
  assert.equal((await api('POST', '/gallery', { form: none })).status, 400);

  const edit = await api('PUT', `/gallery/${up.body.data._id}`, { body: { title: 'Renamed gathering', status: 'draft' } });
  assert.equal(edit.status, 200);
  assert.equal((await api('GET', '/gallery', { auth: false })).body.data.length, 0);
  assert.equal((await api('DELETE', `/gallery/${up.body.data._id}`)).status, 200);
  assert.equal((await fetch(up.body.data.coverImage.url)).status, 404, 'file removed with the photo');
  assert.equal((await fetch(up.body.data.coverImage.thumbUrl)).status, 404, 'thumbnail removed too');
});

t('contact form: validation, honeypot, inbox CRUD', async () => {
  const bad = await api('POST', '/contact', { auth: false, body: { fullName: 'M', email: 'bad', message: 'short' } });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.errors.email);
  const noConsent = await api('POST', '/contact', { auth: false, body: { fullName: 'Mary Joseph', email: 'mary@example.com', subject: 'Admissions', message: long(30, 'a') } });
  assert.equal(noConsent.status, 400);
  const ok = await api('POST', '/contact', { auth: false, body: { fullName: 'Mary Joseph', email: 'mary@example.com', phone: '+91 40 2340 7670', subject: 'Admissions', message: 'I would like to ask about admissions for next year.', consent: true } });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.ok, true);
  assert.match(ok.body.reference, /^JMJ-/);
  const autofilled = await api('POST', '/contact', { auth: false, body: { hp_check: 'filled-by-autofill', fullName: 'Real Person', email: 'real@example.com', subject: 'Autofill', message: 'My browser autofilled a hidden field.', consent: true } });
  assert.equal(autofilled.status, 201);
  assert.notEqual(autofilled.body.reference, 'JMJ-RECEIVED');

  const inbox = await api('GET', '/contact');
  assert.equal(inbox.body.data.length, 2, 'honeypot messages are kept, never discarded');
  assert.equal(inbox.body.unread, 1, 'spam-flagged messages do not count as unread');
  const flagged = inbox.body.data.find((m) => m.fullName === 'Real Person');
  assert.equal(flagged.status, 'spam');
  assert.equal((await api('PATCH', `/contact/${flagged._id}`, { body: { status: 'read' } })).body.data.status, 'read', 'can be moved out of spam');
  const recent = await api('GET', `/contact?since=${encodeURIComponent(new Date(Date.now() - 60000).toISOString())}`);
  assert.equal(recent.body.data.length, 2);
  const id = inbox.body.data.find((m) => m.fullName === 'Mary Joseph')._id;
  assert.equal((await api('PATCH', `/contact/${id}`, { body: { status: 'read' } })).body.data.status, 'read');
  assert.equal((await api('PATCH', `/contact/${id}`, { body: { status: 'bogus' } })).status, 400);
  assert.equal((await api('DELETE', `/contact/${id}`)).status, 200);
});

t('news and notice attachments: upload, show, remove, clean up', async () => {
  const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');
  const upload = async (bytes, type, filename) => {
    const f = new FormData();
    f.append('file', new Blob([bytes], { type }), filename);
    return api('POST', '/uploads', { form: f });
  };

  const noAuth = new FormData();
  noAuth.append('file', new Blob([pdfBytes], { type: 'application/pdf' }), 'circular.pdf');
  const saved = token; token = undefined;
  assert.equal((await api('POST', '/uploads', { form: noAuth })).status, 401, 'uploads need a login');
  token = saved;

  assert.equal((await upload(Buffer.from('MZ'), 'application/x-msdownload', 'virus.exe')).status, 400, 'blocked file type');
  assert.equal((await upload(Buffer.from('<svg onload=alert(1)>'), 'image/svg+xml', 'x.svg')).status, 400, 'SVG blocked');

  const pdf = await upload(pdfBytes, 'application/pdf', 'Circular No. 5 (2026).pdf');
  assert.equal(pdf.status, 201, JSON.stringify(pdf.body));
  assert.equal(pdf.body.data.kind, 'pdf');
  assert.equal(pdf.body.data.name, 'Circular No. 5 (2026).pdf');
  const served = await fetch(pdf.body.data.url);
  assert.equal(served.status, 200);
  assert.equal(served.headers.get('content-type'), 'application/pdf');

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const photo = await upload(png, 'image/png', 'event.png');
  assert.equal(photo.body.data.kind, 'image');
  assert.ok(photo.body.data.thumbUrl);

  const news = await api('POST', '/news', { body: { title: 'Article with files', excerpt: 'Has a PDF and a photo', content: long(120), status: 'published', attachments: [pdf.body.data, photo.body.data, { name: 'bad', url: 'javascript:alert(1)' }] } });
  assert.equal(news.status, 201);
  assert.equal(news.body.data.attachments.length, 2, 'unsafe links dropped');
  const pub = await api('GET', '/news', { auth: false });
  assert.equal(pub.body.data.find((n) => n._id === news.body.data._id).attachments.length, 2, 'visitors see attachments');

  const inUse = await api('DELETE', '/uploads', { body: { publicId: pdf.body.data.publicId } });
  assert.equal(inUse.status, 409, 'a saved attachment cannot be deleted directly');

  const edited = await api('PUT', `/news/${news.body.data._id}`, { body: { attachments: [photo.body.data] } });
  assert.equal(edited.body.data.attachments.length, 1);
  assert.equal((await fetch(pdf.body.data.url)).status, 404, 'removed attachment file deleted');

  const notice = await api('POST', '/notices', { body: { title: 'Notice with a circular', content: long(60), status: 'published', attachments: [pdf.body.data] } });
  assert.equal(notice.status, 201);
  assert.equal(notice.body.data.attachments[0].kind, 'pdf');

  const orphan = await upload(pdfBytes, 'application/pdf', 'never-saved.pdf');
  assert.equal((await api('DELETE', '/uploads', { body: { publicId: orphan.body.data.publicId } })).status, 200);
  assert.equal((await fetch(orphan.body.data.url)).status, 404, 'cancelled upload removed');

  assert.equal((await api('DELETE', `/news/${news.body.data._id}`)).status, 200);
  assert.equal((await fetch(photo.body.data.url)).status, 404, 'files deleted with the article');
  await api('DELETE', `/notices/${notice.body.data._id}`);
});

t('dashboard stats and unknown routes', async () => {
  const stats = await api('GET', '/admin/stats');
  assert.equal(stats.status, 200);
  assert.equal(typeof stats.body.data.unreadMessages, 'number');
  assert.equal((await api('GET', '/does-not-exist')).status, 404);
  const badJson = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(badJson.status, 400);
});

t('change password', async () => {
  const r = await api('POST', '/auth/change-password', { body: { currentPassword: 'Password123!', newPassword: 'NewPassword456!', confirmPassword: 'NewPassword456!' } });
  assert.equal(r.status, 200);
  const login = await api('POST', '/auth/login', { body: { email: 'admin@test.org', password: 'NewPassword456!' } });
  assert.equal(login.status, 200);
});
