// 404 Not Found handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    // MongoDB duplicate key error
    ...(err.code === 11000 && {
      message: 'Duplicate field value entered',
      field: Object.keys(err.keyValue)[0]
    }),
    // MongoDB validation error
    ...(err.name === 'ValidationError' && {
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    }),
    // MongoDB cast error (invalid ID)
    ...(err.name === 'CastError' && {
      message: `Invalid ${err.path}: ${err.value}`
    })
  });
};
