import createHttpError from 'http-errors';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUsersSession,
} from '../services/auth.js';

const setAuthCookies = (
  res,
  { refreshToken, refreshTokenValidUntil, sessionId },
) => {
  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: new Date(refreshTokenValidUntil),
  };

  res.cookie('refreshToken', refreshToken, cookieOpts);
  res.cookie('sessionId', sessionId, cookieOpts);
};

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  return res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  setAuthCookies(res, {
    refreshToken: session.refreshToken,
    refreshTokenValidUntil: session.refreshTokenValidUntil,
    sessionId: session._id,
  });

  return res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

export const logoutUserController = async (req, res) => {
  const sessionId = req.session?._id || req.cookies?.sessionId;
  if (!sessionId) {
    throw createHttpError(401, 'Not authorized');
  }

  await logoutUser(sessionId);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  return res.status(204).end();
};

export const refreshUserSessionController = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const sessionId = req.cookies?.sessionId;

  if (!refreshToken || !sessionId) {
    throw createHttpError(401, 'Not authorized');
  }

  const newSession = await refreshUsersSession({ sessionId, refreshToken });

  setAuthCookies(res, {
    refreshToken: newSession.refreshToken,
    refreshTokenValidUntil: newSession.refreshTokenValidUntil,
    sessionId: newSession._id,
  });

  return res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: newSession.accessToken },
  });
};
