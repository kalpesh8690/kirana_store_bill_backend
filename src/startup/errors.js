import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export function notFound(req, res, next) {
  res.status(StatusCodes.NOT_FOUND).json({ message: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || getReasonPhrase(status);
  const details = err.details || undefined;
  res.status(status).json({ message, details });
}
