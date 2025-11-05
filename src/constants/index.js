import path from 'node:path';

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export const ROLES = {
  CONTACT: 'contact',
  USER: 'user',
};

export const TEMP_UPLOAD_DIR = path.resolve('tmp');
export const UPLOAD_DIR = path.resolve('uploads');
