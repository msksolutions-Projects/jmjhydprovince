/**
 * Backs up every collection to JSON files: backend/backups/<date-time>/<collection>.json
 *   npm run backup
 * Restore a collection with mongoimport (or ask your developer):
 *   mongoimport --uri "$MONGODB_URI" --collection news --jsonArray --file backups/<dir>/news.json
 * Atlas also keeps its own snapshots on paid tiers; this script works on the free tier too.
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('../src/config');

(async () => {
  if (!config.mongoUri) throw new Error('MONGODB_URI is not set in backend/.env');
  await mongoose.connect(config.mongoUri);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dir = path.resolve(__dirname, '../backups', stamp);
  fs.mkdirSync(dir, { recursive: true });
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const { name } of collections) {
    const docs = await mongoose.connection.db.collection(name).find({}).toArray();
    fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(docs, null, 2));
    console.log(`✔ ${name}: ${docs.length} documents`);
  }
  console.log(`Backup saved to ${dir}`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error('Backup failed:', err.message);
  process.exit(1);
});
