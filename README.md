# Billing Backend (Node + Express + MongoDB)

Production-grade backend for a product billing system with users, products, orders, invoices, payments, discounts, taxes, shipping, settings, and audit logs.

## Quick Start

```bash
cp .env.example .env
# edit .env if needed (MONGO_URI, JWT_SECRET)
npm install
npm run seed   # seeds admin user and sample product
npm run dev    # starts on PORT (default 4000)
```

### Auth
- `POST /api/auth/register` { firstName, lastName, email, password, role? }
- `POST /api/auth/login` { email, password } → { token }

### Typical Flow
1. Admin creates categories/products.
2. Customer registers and logs in.
3. Authenticated user creates an order `POST /api/orders` (with productId & quantity).
4. Create invoice from order `POST /api/invoices`.
5. Record payment `POST /api/payments`.

### Scripts
- `npm run seed` – create admin + sample data
- `npm run seed:clean` – empty collections

### Notes
- Uses JWT auth, celebrate/Joi validation, and Mongoose strict schemas.
- Add your own auditing middleware to record changes into the `AuditLog` model on write routes.
- Replace the mock invoice/payment logic with your gateway integration as needed.
