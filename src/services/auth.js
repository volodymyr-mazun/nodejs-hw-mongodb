import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';

import { UsersCollection } from '../db/models/users.js';
import { SessionsCollection } from '../db/models/session.js';

import { FIFTEEN_MINUTES, THIRTY_DAYS, SMTP } from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';

const toBase64Url = (bytes = 30) => randomBytes(bytes).toString('base64url');

const normalizeEmail = (email) =>
  String(email || '')
    .trim()
    .toLowerCase();

const createSession = () => {
  const accessToken = toBase64Url(30);
  const refreshToken = toBase64Url(30);

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const registerUser = async (payload) => {
  const email = normalizeEmail(payload.email);
  const existing = await UsersCollection.findOne({ email });

  if (existing) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await UsersCollection.create({
    ...payload,
    email,
    password: hashedPassword,
  });

  return user.toJSON();
};

export const loginUser = async (payload) => {
  const email = normalizeEmail(payload.email);
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'Unauthorized');
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const sessionData = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...sessionData,
  });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Unauthorized');
  }

  const isExpired =
    Date.now() > new Date(session.refreshTokenValidUntil).getTime();
  if (isExpired) {
    await SessionsCollection.deleteOne({ _id: session._id });
    throw createHttpError(401, 'Unauthorized');
  }

  const newSessionData = createSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSessionData,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const requestResetToken = async (rawEmail) => {
  const email = normalizeEmail(rawEmail);
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const token = jwt.sign(
    { sub: String(user._id), email },
    getEnvVar('JWT_SECRET'),
    { expiresIn: '5m', algorithm: 'HS256' },
  );

  const appDomain = getEnvVar('APP_DOMAIN');
  const resetUrl = `${appDomain.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await sendEmail({
      from: getEnvVar(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html: `
      <p>We received a request to reset the password for your account.</p>
      <p>Click the link below to set a new password (valid for 5 minutes):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async (payload) => {
  let entries;
  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'), {
      algorithms: ['HS256'],
    });
  } catch {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const email = normalizeEmail(entries.email);
  const user = await UsersCollection.findOne({
    _id: entries.sub,
    email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );

  await SessionsCollection.deleteMany({ userId: user._id });
};
