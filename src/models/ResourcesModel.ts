// models/resource.model.ts
import mongoose, { Schema, Document, model } from "mongoose";

export interface IResourceTranslationCategory {
  name: string;
  description?: string;
}

export interface IResourceCategory extends Document {
  name: string;
  description?: string;
  icon?: string;
  translations: Map<string, IResourceTranslationCategory>;
}

export interface IResourceTranslation {
  name: string;
  shortDescription: string;
}

export interface IResource extends Document {
  categoryId: mongoose.Types.ObjectId | IResourceCategory;
  name: string;
  shortDescription: string;
  url: string;
  pdfUrl?: string;
  translations: Map<string, IResourceTranslation>;
}

// ----- Category Schema -----
const ResourceCategorySchema = new Schema<IResourceCategory>(
  {
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    translations: {
      type: Map,
      of: {
        name: { type: String, required: true },
        description: { type: String },
      },
      default: new Map(),
    },
  },
  { timestamps: true }
);

// ----- Resource Schema -----
const ResourceSchema = new Schema<IResource>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ResourceCategory",
      required: true,
    },
    name: { type: String, required: true },
    shortDescription: { type: String, required: true },
    url: { type: String, required: true },
    pdfUrl: { type: String },
    translations: {
      type: Map,
      of: {
        name: { type: String, required: true },
        shortDescription: { type: String, required: true },
      },
      default: new Map(),
    },
  },
  { timestamps: true }
);

// ----- Models -----
export const ResourceCategoryModel = model<IResourceCategory>(
  "ResourceCategory",
  ResourceCategorySchema
);
export const ResourceModel = model<IResource>("Resource", ResourceSchema);
