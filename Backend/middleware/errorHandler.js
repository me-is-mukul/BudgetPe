const notFound = (req, res, next) => {
  console.warn(`[404] route not found: ${req.method} ${req.originalUrl}`);
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    console.warn(`[errorHandler] duplicate key — field: ${field}`);
    return res.status(400).json({ message: `${field} already exists` });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    console.warn(`[errorHandler] validation error — ${messages.join(", ")}`);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    console.warn(`[errorHandler] invalid token`);
    return res.status(401).json({ message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    console.warn(`[errorHandler] token expired`);
    return res.status(401).json({ message: "Token expired" });
  }

  console.error(`[errorHandler] ${statusCode} — ${err.message}`);
  res.status(statusCode).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export { notFound, errorHandler };
