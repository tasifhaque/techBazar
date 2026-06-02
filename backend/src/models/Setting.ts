import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  siteName: string;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    siteName: { type: String, required: true, default: "LUXE" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, versionKey: false }
);

export const Setting = mongoose.model<ISetting>("Setting", SettingSchema);
