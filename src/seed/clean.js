import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../startup/db.js';
import mongoose from 'mongoose';

const collections = ['users','products','categories','orders','invoices','payments','discounts','taxes','shippings','settings','auditlogs'];

const run = async () => {
  await connectDB();
  for (const c of collections) {
    try {
      await mongoose.connection.db.collection(c).deleteMany({});
      // eslint-disable-next-line no-console
      console.log('Cleared', c);
    } catch (e) {}
  }
  process.exit(0);
};

run();
