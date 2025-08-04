import mongoose, { Schema, Document } from "mongoose";

export interface IOption {
  _id: string;
  text: string;
  score: number;
}

export interface IWeightOption {
  _id?: string;
  weight: string;
  score: number;
}

export interface IHeightOption {
  _id?: string;
  height: string;
  weights: IWeightOption[];
}

export interface IQuestion {
  _id: string;
  text: string;
  type: "multiple" | "input" | "textarea" | "dropdown" | "radio" | "height-weight";
  options: IOption[];
  heightOptions?: IHeightOption[];
  order: number;
}

export interface ILevel {
  _id: string;
  name: string;
  proposedSolution: string;
  from: number;
  to: number;
}
export interface ITranslation {
  name: string;
  overview?: string;
  purpose?: string;
  duration?: string;
  benefits?: string[];
  // questions: IQuestion[]; // only translate question text and options. remaing same.
  // interpretations: ILevel[];
}
export interface IScreening extends Document {
  name: string;
  slug: string;
  description?: string;
  overview?: string;
  purpose?: string;
  duration?: string;
  benefits?: string[];
  status: "active" | "inactive" | "draft";
  imageURL?: string;
  questions: IQuestion[];
  interpretations: ILevel[];
  createdAt: Date;
  updatedAt: Date;

  translations: Map<string, ITranslation>;

  getFieldsToTranslate(): string[];
}

const TranslationSchema = new Schema<ITranslation>({
  name: { type: String, required: true },
  overview: { type: String },
  purpose: { type: String },
  duration: { type: String },
  benefits: { type: [String] },
  // // @ts-ignore
  // questions: { type: [Schema.Types.Mixed], required: false },
  // // @ts-ignore
  // interpretations: { type: [Schema.Types.Mixed], required: false },
});

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
    overview: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    benefits: {
      type: [String],
      trim: true,
    },
    questions: {
      type: [
        {
          _id: { type: String, required: true },
          text: { type: String, required: true },
          type: {
            type: String,
            enum: [
              "multiple",
              "text",
              "number",
              "date",
              "textarea",
              "dropdown",
              "radio",
              "height-weight",
            ],
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
          heightOptions: {
            type: [
              {
                _id: { type: String, required: false },
                height: { type: String, required: false },
                weights: {
                  type: [
                    {
                      _id: { type: String, required: false },
                      weight: { type: String, required: false },
                      score: { type: Number, required: true, default: 0 },
                    },
                  ],
                  required: false,
                },
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
      default: "active",
    },
    imageURL: {
      type: String,
    },
    translations: {
      type: Map,
      of: TranslationSchema,
      default: new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ScreeningSchema.methods.getFieldsToTranslate = function (): string[] {
  return [
    "name",
    "description",
    "overview",
    "purpose",
    "duration",
    "benefits",
    "questions",
    "interpretations",
  ];
};

ScreeningSchema.index({ slug: 1, status: 1 });
const Screening = mongoose.model<IScreening>("Screening", ScreeningSchema);
export default Screening;
