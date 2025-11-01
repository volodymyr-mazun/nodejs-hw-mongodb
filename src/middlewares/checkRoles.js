import createHttpError from 'http-errors';

export const checkRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    const user = req.user;

    if (!user) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(createHttpError(403, 'Forbidden'));
    }

    next();
  };
