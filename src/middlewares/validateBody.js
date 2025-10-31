import createHttpError from 'http-errors';

export function validateBody(schema) {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (err) {
      const messages = (err.details || []).map((d) =>
        d.message.replace(/"/g, ''),
      );
      next(createHttpError(400, messages.join(', ')));
    }
  };
}
