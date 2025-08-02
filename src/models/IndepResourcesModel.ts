import mongoose, { model, Schema } from "mongoose";

export interface IIndepCategory extends Document {
  name: string;
  description?: string;
  icon?: string;
}

export interface IIndepResource extends Document {
  categoryId: mongoose.Types.ObjectId | IIndepCategory;
  name: string;
  shortDescription: string;
  url: string;
  pdfUrl?: string;
}

const IndepCategorySchema = new Schema<IIndepCategory>(
  {
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
  },
  { timestamps: true }
);

const IndepResourceSchema = new Schema<IIndepResource>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "IndepCategory",
      required: true,
    },
    name: { type: String, required: true },
    shortDescription: { type: String, required: true },
    url: { type: String, required: true },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

export const IndepCategoryModel = model<IIndepCategory>(
  "IndepCategory",
  IndepCategorySchema
);
export const IndepResourceModel = model<IIndepResource>(
  "IndepResource",
  IndepResourceSchema
);
