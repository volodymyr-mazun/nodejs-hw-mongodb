import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/users.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return next(createHttpError(401, 'Not authorized'));
  }

  const session = await SessionsCollection.findOne({ accessToken: token });
  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  const isExpired =
    Date.now() > new Date(session.accessTokenValidUntil).getTime();
  if (isExpired) {
    return next(createHttpError(401, 'Access token expired'));
  }

  const user = await UsersCollection.findById(session.userId);
  if (!user) {
    return next(createHttpError(401, 'User not found'));
  }

  req.user = user;
  req.session = session;
  next();
};
