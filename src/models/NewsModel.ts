import mongoose, { Document, Types } from "mongoose";
export interface ISEO {
  metaTitle: string;
  slug: string;
  metaDescription: string;
}

export interface INews extends Document {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  SEO: ISEO;
}

const newsSchema = new mongoose.Schema<INews>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: false },
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
  },
  {
    timestamps: true,
  }
);

const News = mongoose.model("News", newsSchema);

export default News;
