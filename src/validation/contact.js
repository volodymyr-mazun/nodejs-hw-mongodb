import Joi from 'joi';
import { isValidObjectId } from 'mongoose';

const name = Joi.string().min(3).max(20);
const phoneNumber = Joi.string().min(3).max(20);
const email = Joi.string().email().min(3).max(50);
const isFavourite = Joi.boolean();
const contactType = Joi.string().valid('work', 'home', 'personal');

const objectId = Joi.string().custom((value, helper) => {
  if (!isValidObjectId(value)) {
    return helper.message('userId should be a valid mongo id');
  }
  return value;
});

export const contactSchema = Joi.object({
  name: name.required(),
  phoneNumber: phoneNumber.required(),
  email,
  isFavourite,
  contactType: contactType.required(),
  userId: objectId.required(),
});

export const updateContactSchema = Joi.object({
  name,
  phoneNumber,
  email,
  isFavourite,
  contactType,
}).min(1);
