import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  siteName: string;
  helpEmail?: string;
  helpPhone?: string;
  helpLocation?: string;
  helpHours?: string;
  helpFaq?: { question: string; answer: string }[];
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    siteName: { type: String, required: true, default: "LUXE" },
    helpEmail: { type: String },
    helpPhone: { type: String },
    helpLocation: { type: String },
    helpHours: { type: String },
    helpFaq: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, versionKey: false }
);

export const Setting = mongoose.model<ISetting>("Setting", SettingSchema);
