import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../startup/db.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const run = async () => {
  await connectDB();

  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    firstName: 'Admin', lastName: 'User', email: 'admin@example.com', passwordHash: adminPass, role: 'admin'
  });

  const cat = await Category.create({ name: 'General', description: 'Default category' });
  const prod = await Product.create({
    name: 'Sample Product', description: 'A demo item', sku: 'SKU-001', category: cat._id, price: 49.99, stockQuantity: 100
  });

  // eslint-disable-next-line no-console
  console.log('Seeded admin:', admin.email, 'product:', prod.sku);
  process.exit(0);
};

run();
