import { createRequire } from 'module';
const req = createRequire('D:/apple-it-zone/backend/package.json');
const dotenv = req('dotenv');
dotenv.config({ path: 'D:/apple-it-zone/backend/.env' });
const dns = await import('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = req('mongoose');
const bcrypt = req('bcryptjs');

const isHashed = (pwd) => pwd && typeof pwd === 'string' && pwd.startsWith('$2');

(async () => {
  try {
    await mongoose.connect(process.env.DB_URI, { serverSelectionTimeoutMS: 20000 });
    const coll = mongoose.connection.db.collection('teammembers');
    const all = await coll.find({}).toArray();
    let hashed = 0;
    let unchanged = 0;
    for (const member of all) {
      const pwd = member.password;
      if (!pwd) { unchanged++; continue; }
      if (isHashed(pwd)) { unchanged++; continue; }
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(pwd, salt);
      await coll.updateOne(
        { _id: member._id },
        { $set: { password: hash } }
      );
      hashed++;
      console.log(`Hashed plaintext password for ${member.email}`);
    }
    console.log(`Done. Hashed: ${hashed}, unchanged/skipped: ${unchanged}`);
    await mongoose.disconnect();
  } catch (e) {
    console.error('Migration error:', e.message);
    process.exit(1);
  }
})();