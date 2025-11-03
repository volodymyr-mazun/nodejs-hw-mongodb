import createHttpError from 'http-errors';
import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  contactType,
  isFavourite,
  userId,
}) => {
  if (!userId) {
    throw createHttpError(401, 'Unauthorized: userId is required');
  }

  const safePage = Math.max(1, Number.isFinite(+page) ? +page : 1);
  const safePerPage = Math.min(
    Math.max(1, Number.isFinite(+perPage) ? +perPage : 10),
    100,
  );
  const skip = (safePage - 1) * safePerPage;

  const filter = { userId };
  if (typeof contactType === 'string' && contactType.trim()) {
    filter.contactType = contactType.trim();
  }
  if (typeof isFavourite === 'boolean') {
    filter.isFavourite = isFavourite;
  }

  const sortDirection = sortOrder === SORT_ORDER.DESC ? -1 : 1;
  const sortObject =
    sortBy === '_id'
      ? { _id: sortDirection }
      : { [sortBy]: sortDirection, _id: 1 };

  const [totalItems, contacts] = await Promise.all([
    ContactsCollection.countDocuments(filter),
    ContactsCollection.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(safePerPage)
      .lean(),
  ]);

  const pagination = calculatePaginationData(totalItems, safePerPage, safePage);
  return { data: contacts, ...pagination };
};

export const getContactById = async (contactId, userId) => {
  if (!userId) throw createHttpError(401, 'Unauthorized');
  const contact = await ContactsCollection.findOne({
    _id: contactId,
    userId,
  }).lean();
  if (!contact) throw createHttpError(404, 'Contact not found');
  return contact;
};

export const createContact = async (payload) => {
  if (!payload.userId) {
    throw createHttpError(401, 'Unauthorized: missing userId');
  }
  const doc = await ContactsCollection.create(payload);
  return doc.toObject();
};

export const updateContactById = async (
  contactId,
  payload,
  userId,
  options = {},
) => {
  if (!userId) throw createHttpError(401, 'Unauthorized');
  const updated = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    { new: true, runValidators: true, ...options },
  ).lean();
  if (!updated) throw createHttpError(404, 'Contact not found');
  return updated;
};

export const deleteContactById = async (contactId, userId) => {
  if (!userId) throw createHttpError(401, 'Unauthorized');
  const deleted = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  }).lean();
  if (!deleted) throw createHttpError(404, 'Contact not found');
  return deleted;
};
