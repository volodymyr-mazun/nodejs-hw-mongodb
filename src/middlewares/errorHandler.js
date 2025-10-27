import createHttpError from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  if (createHttpError.isHttpError(err)) {
    res.status(err.status || 500).json({
      status: err.status,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
  });
};
