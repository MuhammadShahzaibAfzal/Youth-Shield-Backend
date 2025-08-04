import mongoose, { Document, Types } from "mongoose";

export interface ITranslateSEO {
  metaTitle: string;
  metaDescription: string;
}

export interface ISEO {
  metaTitle: string;
  slug: string;
  metaDescription: string;
}

export interface INewsTranslation {
  title: string;
  content: string;
  shortDescription?: string;
  SEO: ITranslateSEO;
}

export interface INews extends Document {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  cardImage?: string;
  category: Types.ObjectId;
  shortDescription?: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  SEO: ISEO;
  translations: Map<string, INewsTranslation>;
}

const newsSchema = new mongoose.Schema<INews>(
  {
    title: { type: String, required: true },
    shortDescription: { type: String },
    content: { type: String, required: true },
    cardImage: { type: String, required: false },
    coverImage: { type: String, required: false },
    isFeatured: { type: Boolean, default: false },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    SEO: {
      metaTitle: { type: String, required: false },
      slug: { type: String, required: false },
      metaDescription: { type: String, required: false },
    },
    translations: {
      type: Map,
      of: {
        title: { type: String, required: true },
        content: { type: String, required: true },
        shortDescription: { type: String },
        SEO: {
          metaTitle: { type: String, required: false },
          metaDescription: { type: String, required: false },
        },
      },
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

const News = mongoose.model("News", newsSchema);

export default News;
