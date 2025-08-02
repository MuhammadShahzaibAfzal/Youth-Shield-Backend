import mongoose from "mongoose";

export interface ITranslation {
  name: string;
}

export interface ICategoryModel extends mongoose.Document {
  name: string;
  slug: string;
  status: "active" | "inactive";
  translations: Map<string, ITranslation>;
  createdAt: Date;
  updatedAt: Date;

  getFieldsToTranslate(): string[];
}

const TranslationSchema = new mongoose.Schema<ITranslation>({
  name: { type: String, required: true },
});

const CategorySchema = new mongoose.Schema<ICategoryModel>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    translations: {
      type: Map,
      of: TranslationSchema,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.methods.getFieldsToTranslate = function (): string[] {
  return ["name"];
};

const Category = mongoose.model<ICategoryModel>("Category", CategorySchema);
export default Category;
