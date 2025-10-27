import { ContactsCollection } from '../db/models/contacts.js';

export const getAllContacts = async () => {
  const contacts = await ContactsCollection.find().lean();
  return contacts;
};

export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId).lean();
  return contact;
};

export const createContact = async (payload) => {
  const doc = await ContactsCollection.create(payload);
  return doc.toObject();
};

export const updateContactById = async (contactId, payload, options = {}) => {
  const contact = await ContactsCollection.findByIdAndUpdate(
    contactId,
    payload,
    {
      new: true,
      runValidators: true,
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
