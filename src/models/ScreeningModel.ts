import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOption {
  _id: string;
  text: string;
  score: number;
}

export interface IQuestion {
  _id: string;
  text: string;
  type: "multiple" | "boolean";
  options: IOption[];
  order: number;
}

export interface IScreening extends Document {
  name: string;
  slug: string;
  description?: string;
  status: "active" | "inactive" | "draft";
  imageURL?: string;
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Screening name is required"],
      trim: true,
      maxlength: [100, "Screening name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    questions: {
      type: [
        {
          _id: { type: String, required: true },
          text: { type: String, required: true },
          type: { type: String, enum: ["multiple", "boolean"], required: true },
          options: {
            type: [
              {
                _id: { type: String, required: true },
                text: { type: String, required: true },
                score: { type: Number, required: true },
              },
            ],
            required: true,
          },
          order: { type: Number, required: true },
        },
      ],
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "draft"],
        message: "Status must be either 'active', 'inactive', or 'draft'",
      },
      default: "draft",
    },
    imageURL: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ScreeningSchema.index({ slug: 1, status: 1 });
const Screening = mongoose.model<IScreening>("Screening", ScreeningSchema);
export default Screening;
