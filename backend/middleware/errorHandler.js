// backend/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    details: err.details || undefined,
  });
}
