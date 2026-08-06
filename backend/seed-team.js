import { createRequire } from 'module';
const req = createRequire('D:/apple-it-zone/backend/package.json');
const dotenv = req('dotenv');
dotenv.config({ path: 'D:/apple-it-zone/backend/.env' });
const dns = await import('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = req('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.DB_URI, { serverSelectionTimeoutMS: 20000 });
    const collection = mongoose.connection.db.collection('teammembers');
    const now = new Date();
    const seedData = [
      {
        name: 'Rashed Karim',
        email: 'rashed@appleitzone.com',
        role: 'super_admin',
        active: true,
        lastLogin: now,
        password: 'hashedPassword1',
      },
      {
        name: 'Nusrat Jahan',
        email: 'nusrat@appleitzone.com',
        role: 'admin',
        active: true,
        lastLogin: now,
        password: 'hashedPassword2',
      },
      {
        name: 'Tanvir Hasan',
        email: 'tanvir@appleitzone.com',
        role: 'manager',
        active: true,
        lastLogin: now,
        password: 'hashedPassword3',
      },
      {
        name: 'Sadia Islam',
        email: 'sadia@appleitzone.com',
        role: 'manager',
        active: false,
        lastLogin: new Date('2026-06-28T11:12:00Z'),
        password: 'hashedPassword4',
      },
    ];

    await collection.deleteMany({});
    const result = await collection.insertMany(seedData);
    console.log('Seeded', result.insertedCount, 'team members');
    await mongoose.disconnect();
  } catch (e) {
    console.error('Seed error:', e.message);
    process.exit(1);
  }
});
