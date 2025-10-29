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
}) => {
  const safePage = Math.max(1, Number(page));
  const safePerPage = Math.min(Math.max(1, Number(perPage)), 100);
  const skip = (safePage - 1) * safePerPage;
  const limit = safePerPage;
  const mongoFilter = {};

  if (typeof contactType === 'string' && contactType.length > 0) {
    mongoFilter.contactType = contactType;
  }

  if (typeof isFavourite === 'boolean') {
    mongoFilter.isFavourite = isFavourite;
  }

  const sortDirection = sortOrder === SORT_ORDER.DESC ? -1 : 1;
  const sortObject = { [sortBy]: sortDirection };
  const [totalItems, contacts] = await Promise.all([
    ContactsCollection.countDocuments(mongoFilter),
    ContactsCollection.find(mongoFilter)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const paginationData = calculatePaginationData(
    totalItems,
    safePerPage,
    safePage,
  );

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId).lean();
  return contact;
};

export const createContact = async (payload) => {
  const doc = await ContactsCollection.create(payload);
  return doc.toObject(); // повертаємо простий об'єкт без Mongoose-методів
};

export const updateContactById = async (contactId, payload, options = {}) => {
  const contact = await ContactsCollection.findByIdAndUpdate(
    contactId,
    payload,
    {
      new: true, // повернути оновлений документ
      runValidators: true, // ганяємо валідацію схеми
      ...options,
    },
  ).lean();

  return contact;
};

export const deleteContactById = async (contactId) => {
  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
  }).lean();

  return contact;
};
