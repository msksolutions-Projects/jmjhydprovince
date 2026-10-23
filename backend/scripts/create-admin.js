/**
 * Create an admin, or reset an existing admin's password and unlock the account.
 *   npm run create-admin -- "Full Name" email@example.com "NewPassword123!"
 */
const mongoose = require('mongoose');
const config = require('../src/config');
const Admin = require('../src/models/Admin');

(async () => {
  const [name, emailArg, password] = process.argv.slice(2);
  const email = String(emailArg || '').trim().toLowerCase();
  if (!name || !email || !password || password.length < 8) {
    console.log('Usage: npm run create-admin -- "Full Name" email@example.com "Password (8+ chars)"');
    process.exit(1);
  }
  await mongoose.connect(config.mongoUri);
  let admin = await Admin.findOne({ email }).select('+password');
  if (admin) {
    admin.password = password;
    admin.name = name;
    admin.isActive = true;
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();
    console.log(`✔ Password reset and account unlocked for ${email}`);
  } else {
    const first = (await Admin.countDocuments()) === 0;
    admin = await Admin.create({ name, email, password, role: first ? 'super_admin' : 'admin' });
    console.log(`✔ Created ${admin.role} ${email}`);
  }
  await mongoose.disconnect();
})().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
