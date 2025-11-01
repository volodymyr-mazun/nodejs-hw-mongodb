import {
  getAllContacts,
  getContactById,
  createContact,
  updateContactById,
  deleteContactById,
} from '../services/contacts.js';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import createHttpError from 'http-errors';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const { contactType, isFavourite } = parseFilterParams(req.query);
  const userId = req.user?._id;

  const result = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    contactType,
    isFavourite,
    userId,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: result.data,
    pagination: {
      page: result.page,
      perPage: result.perPage,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    },
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const userId = req.user?._id;
  const created = await createContact({
    ...req.body,
    ...(userId ? { userId } : {}),
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: created,
  });
};

export const updateContactController = async (req, res) => {
  const { contactId } = req.params;
  const updated = await updateContactById(contactId, req.body);
  if (!updated) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updated,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const removed = await deleteContactById(contactId);
  if (!removed) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).end();
};
