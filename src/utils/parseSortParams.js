import { SORT_ORDER } from '../constants/index.js';

const parseSortOrder = (sortOrder) => {
  if (typeof sortOrder !== 'string') return SORT_ORDER.ASC;
  const normalized = sortOrder.toLowerCase();
  const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(normalized);
  return isKnownOrder ? normalized : SORT_ORDER.ASC;
};

const parseSortBy = (sortBy) => {
  const keysOfContact = [
    '_id',
    'name',
    'phoneNumber',
    'email',
    'isFavourite',
    'contactType',
    'createdAt',
    'updatedAt',
  ];
  return keysOfContact.includes(sortBy) ? sortBy : '_id';
};

export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;

  return Object.freeze({
    sortOrder: parseSortOrder(sortOrder),
    sortBy: parseSortBy(sortBy),
  });
};
