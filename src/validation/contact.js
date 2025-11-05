import Joi from 'joi';
import { isValidObjectId } from 'mongoose';

export const contactSchema = Joi.object({
  name: Joi.string().required().min(3).max(20),
  phoneNumber: Joi.string().required().min(3).max(20),
  email: Joi.string().email().min(3).max(50),
  isFavourite: Joi.boolean().default(false),
  contactType: Joi.string()
    .default('personal')
    .required()
    .valid('work', 'home', 'personal'),
  userId: Joi.string().custom((value, helper) => {
    if (value && !isValidObjectId(value)) {
      return helper.message(
        'The contact ID must be valid for a specific user.',
      );
    }
    return true;
  }),
});

export const updateContactSchema = Joi.object({
  name: Joi.string(),
  phoneNumber: Joi.string(),
  email: Joi.string().email(),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('work', 'home', 'personal'),
});
