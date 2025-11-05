import { Schema, model } from 'mongoose';

const contactsSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    isFavourite: { type: Boolean, default: false },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      required: true,
      default: 'personal',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    photo: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'contacts',
  },
);

export const ContactsCollection = model('Contact', contactsSchema);
