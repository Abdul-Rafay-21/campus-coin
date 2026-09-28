/** Idempotent local administrator setup. Never resets an existing admin password. */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/models.js';

const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  console.error('Set MONGO_URI, ADMIN_EMAIL and a strong ADMIN_PASSWORD (12+ chars) in backend/.env first.');
  process.exit(1);
}

try {
  await mongoose.connect(MONGO_URI);
  const administratorEmail = ADMIN_EMAIL.trim().toLowerCase();
  let administratorAccount = await User.findOne({ email: administratorEmail });
  if (administratorAccount && administratorAccount.role !== 'admin') {
    throw new Error('Email belongs to a student. Use a different ADMIN_EMAIL.');
  }
  if (!administratorAccount) {
    administratorAccount = await User.create({
      name: ADMIN_NAME || 'Campus Admin',
      email: administratorEmail,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
      role: 'admin',
      emailVerified: true,
      status: 'active',
    });
    console.log(`Created administrator ${administratorAccount.email}`);
  } else {
    console.log(`Administrator already exists: ${administratorAccount.email}. Password was not changed.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
