import authRoutes from '../routes/auth.routes.js';
import userRoutes from '../routes/user.routes.js';
import customerRoutes from '../routes/customer.routes.js';
import productRoutes from '../routes/product.routes.js';
import categoryRoutes from '../routes/category.routes.js';
import orderRoutes from '../routes/order.routes.js';
import invoiceRoutes from '../routes/invoice.routes.js';
import paymentRoutes from '../routes/payment.routes.js';
import discountRoutes from '../routes/discount.routes.js';
import taxRoutes from '../routes/tax.routes.js';
import shippingRoutes from '../routes/shipping.routes.js';
import settingsRoutes from '../routes/settings.routes.js';
import auditRoutes from '../routes/audit.routes.js';

export default function routes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/discounts', discountRoutes);
  app.use('/api/taxes', taxRoutes);
  app.use('/api/shipping', shippingRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/audit', auditRoutes);
}
