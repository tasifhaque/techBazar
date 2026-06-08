import mongoose, { Schema } from "mongoose";

export interface IProduct {
  _id?: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  category: string;
  brand: string;
  model: string;
  images: string[];
  stock: number;
  featured: boolean;
  featuredOrder: number;
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: String, required: true, lowercase: true, trim: true },
    brand: { type: String, required: true, lowercase: true, trim: true },
    model: { type: String, required: true, lowercase: true, trim: true },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, min: 0, default: 0 },
    featured: { type: Boolean, default: false },
    featuredOrder: { type: Number, default: 0 },
    specifications: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, versionKey: false }
);

ProductSchema.index({ category: 1, brand: 1, model: 1 }, { unique: true });
ProductSchema.index({ featured: 1, featuredOrder: 1, createdAt: -1 });

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
