import mongoose from "mongoose";

export interface INewsLetter extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  createdAt: Date;
  updatedAt: Date;
}

const NewsLetterSchema = new mongoose.Schema<INewsLetter>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },
  },
  {
    timestamps: true,
  }
);

const NewsLetter = mongoose.model<INewsLetter>("NewsLetter", NewsLetterSchema);
export default NewsLetter;
