import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  gender: "male" | "female";
  avatarUrl: string;
  role: "user" | "admin";
  phone: string;
  emailVerified: boolean;
  verificationCode: string;
  resetCode: string;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    avatarUrl: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },
    verificationCode: { type: String, default: "" },
    resetCode: { type: String, default: "" },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, versionKey: false }
);

export const User = mongoose.model<IUser>("User", UserSchema);
