import mongoose, { Schema, Document } from "mongoose";

export interface IOption {
  _id: string;
  text: string;
  score: number;
}

export interface IQuestion {
  _id: string;
  text: string;
  type: "multiple" | "dropdown";
  options: IOption[];
  order: number;
}

export interface ITranslatedQuestion {
  _id: string;
  text: string;
  options?: Array<{
    _id: string;
    text: string;
  }>;
}
export interface ITranslation {
  name: string;
  description: string;
  questions?: ITranslatedQuestion[];
}
export interface IContest extends Document {
  name: string;
  slug: string;
  description?: string;
  status: "active" | "inactive";
  imageURL?: string;
  questions: IQuestion[];
  fromDate: Date;
  fromTime: string;
  toDate: Date;
  toTime: string;
  totalSubmissions: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
  translations: Map<string, ITranslation>;
}

const TranslatedQuestionSchema = new Schema<ITranslatedQuestion>({
  _id: { type: String, required: true },
  text: { type: String, required: true },
  options: {
    type: [
      {
        _id: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    required: false,
  },
});

const ContestSchema: Schema = new Schema<IContest>(
  {
    name: {
      type: String,
      required: [true, "Context name is required"],
      trim: true,
      maxlength: [100, "Context name cannot exceed 100 characters"],
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
            enum: ["multiple", "dropdown"],
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

    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "Status must be either 'active' or 'inactive'",
      },
      default: "active",
    },
    imageURL: {
      type: String,
    },
    fromDate: {
      type: Date,
    },
    fromTime: {
      type: String,
    },
    toDate: {
      type: Date,
    },
    toTime: {
      type: String,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },

    translations: {
      type: Map,
      of: {
        name: { type: String, required: true },
        description: { type: String, required: false },
        questions: {
          type: [TranslatedQuestionSchema],
          required: false,
        },
      },
      default: new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ContestSchema.index({ slug: 1, status: 1 });
const Contest = mongoose.model<IContest>("Contest", ContestSchema);
export default Contest;
