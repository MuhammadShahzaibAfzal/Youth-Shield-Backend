import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOption {
  _id: Types.ObjectId;
  text: string;
  score: number;
}

export interface IQuestion {
  _id: Types.ObjectId;
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

const OptionSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: [true, "Option text is required"],
      trim: true,
      maxlength: [500, "Option text cannot exceed 500 characters"],
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [0, "Score cannot be negative"],
    },
  },
  { _id: true }
);

const QuestionSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      maxlength: [1000, "Question text cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["multiple", "boolean"],
        message: "Question type must be either 'multiple' or 'boolean'",
      },
      required: true,
      default: "multiple",
    },
    options: {
      type: [OptionSchema],
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

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
      type: [QuestionSchema],
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
