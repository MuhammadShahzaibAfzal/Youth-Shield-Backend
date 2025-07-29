// models/resource.model.ts
import mongoose, { Schema, Document, model } from "mongoose";

export interface IResourceCategory extends Document {
  name: string;
  description?: string;
}

export interface IResource extends Document {
  categoryId: mongoose.Types.ObjectId | IResourceCategory;
  name: string;
  shortDescription: string;
  url: string;
  pdfUrl?: string;
}

// ----- Category Schema -----
const ResourceCategorySchema = new Schema<IResourceCategory>(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

// ----- Resource Schema -----
const ResourceSchema = new Schema<IResource>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true },
    shortDescription: { type: String, required: true },
    url: { type: String, required: true },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

// ----- Models -----
export const ResourceCategoryModel = model<IResourceCategory>(
  "ResourceCategory",
  ResourceCategorySchema
);
export const ResourceModel = model<IResource>("Resource", ResourceSchema);
