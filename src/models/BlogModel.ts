import mongoose, { Document, Types } from "mongoose";
export interface ISEO {
  metaTitle: string;
  slug: string;
  metaDescription: string;
}

export interface IBlog extends Document {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  SEO: ISEO;
}

const blogSchema = new mongoose.Schema<IBlog>(
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

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
