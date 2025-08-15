import 'express-async-errors';
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errors } from 'celebrate';

import { connectDB } from './startup/db.js';
import { logger } from './startup/logger.js';
import { notFound, errorHandler } from './startup/errors.js';
import routes from './startup/routes.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

const windowMinutes = Number(process.env.RATE_LIMIT_WINDOW_MIN || 15);
const maxReq = Number(process.env.RATE_LIMIT_MAX || 100);
app.use(rateLimit({ windowMs: windowMinutes * 60 * 1000, max: maxReq }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

routes(app);

// celebrate validation errors
app.use(errors());

// 404 + general error handlers
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(port, () => logger.info(`Server running on port ${port}`));
}).catch((err) => {
  logger.error('Failed to connect DB', { err });
  process.exit(1);
});
