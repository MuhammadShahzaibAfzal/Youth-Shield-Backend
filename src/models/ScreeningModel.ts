import mongoose, { Schema, Document } from "mongoose";

export interface IOption {
  _id: string;
  text: string;
  score: number;
}

export interface IQuestion {
  _id: string;
  text: string;
  type: "multiple" | "input" | "textarea" | "dropdown" | "radio";
  options: IOption[];
  order: number;
}

export interface ILevel {
  _id: string;
  name: string;
  proposedSolution: string;
  from: number;
  to: number;
}

export interface IScreening extends Document {
  name: string;
  slug: string;
  description?: string;
  status: "active" | "inactive" | "draft";
  imageURL?: string;
  questions: IQuestion[];
  interpretations: ILevel[];
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
          type: {
            type: String,
            enum: ["multiple", "text", "number", "date", "textarea", "dropdown", "radio"],
            required: true,
          },
          options: {
            type: [
              {
                _id: { type: String, required: true },
                text: { type: String, required: false },
                score: { type: Number, required: true, default: 0 },
              },
            ],
            required: false,
          },
          order: { type: Number, required: false },
        },
      ],
      required: true,
    },
    interpretations: {
      type: [
        {
          _id: { type: String, required: true },
          name: { type: String, required: true },
          proposedSolution: { type: String, required: true },
          from: { type: Number, required: true },
          to: { type: Number, required: true },
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
