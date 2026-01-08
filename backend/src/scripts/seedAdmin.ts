import mongoose from 'mongoose';

import { connectDb } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User';

const run = async (): Promise<void> => {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? 'Admin User';

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required');
  }

  await connectDb();

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    if (existing.name !== name) {
      existing.name = name;
    }
    existing.password = password;
    await existing.save();
    // eslint-disable-next-line no-console
    console.log('Admin updated:', existing.email);
    return;
  }

  const admin = await User.create({ name, email, password, role: 'admin' });
  // eslint-disable-next-line no-console
  console.log('Admin created:', admin.email);
};

run()
  .then(async () => {
    await mongoose.connection.close();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error('Seeder failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  });
