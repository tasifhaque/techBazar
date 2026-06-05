import mongoose, { Schema } from "mongoose";

export interface IContactMessage {
  _id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, versionKey: false }
);

export const ContactMessage = mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);
