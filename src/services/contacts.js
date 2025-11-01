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
  const safePage = Math.max(1, Number(page));
  const safePerPage = Math.min(Math.max(1, Number(perPage)), 100);
  const skip = (safePage - 1) * safePerPage;

  const filter = {};
  if (userId) filter.userId = userId;
  if (typeof contactType === 'string' && contactType.length > 0) {
    filter.contactType = contactType;
  }
  if (typeof isFavourite === 'boolean') {
    filter.isFavourite = isFavourite;
  }

  const sortDirection = sortOrder === SORT_ORDER.DESC ? -1 : 1;
  const sortObject = { [sortBy]: sortDirection };

  const [totalItems, contacts] = await Promise.all([
    ContactsCollection.countDocuments(filter),
    ContactsCollection.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(safePerPage)
      .lean(),
  ]);

  const pagination = calculatePaginationData(totalItems, safePerPage, safePage);

  return {
    data: contacts,
    ...pagination,
  };
};

export const getContactById = async (contactId, userId) => {
  if (userId) {
    return ContactsCollection.findOne({ _id: contactId, userId }).lean();
  }
  return ContactsCollection.findById(contactId).lean();
};

export const createContact = async (payload) => {
  const doc = await ContactsCollection.create(payload);
  return doc.toObject();
};

export const updateContactById = async (
  contactId,
  payload,
  userId,
  options = {},
) => {
  const query = userId ? { _id: contactId, userId } : { _id: contactId };
  return ContactsCollection.findOneAndUpdate(query, payload, {
    new: true,
    runValidators: true,
    ...options,
  }).lean();
};

export const deleteContactById = async (contactId, userId) => {
  const query = userId ? { _id: contactId, userId } : { _id: contactId };
  return ContactsCollection.findOneAndDelete(query).lean();
};
