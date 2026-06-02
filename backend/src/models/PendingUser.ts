import mongoose, { Schema, Document } from "mongoose";

export interface IPendingUser extends Document {
  name: string;
  email: string;
  password: string;
  gender: "male" | "female";
  avatarUrl: string;
  verificationCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const PendingUserSchema = new Schema<IPendingUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    avatarUrl: { type: String, default: "" },
    verificationCode: { type: String, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, versionKey: false }
);

PendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export const PendingUser = mongoose.model<IPendingUser>("PendingUser", PendingUserSchema);
