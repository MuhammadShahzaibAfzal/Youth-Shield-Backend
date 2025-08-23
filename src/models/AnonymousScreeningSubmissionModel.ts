import mongoose, { Document, Schema } from "mongoose";

export interface IPersonalInfo {
  firstName: string;
  lastName: string;
  email?: string;
  gender: string;
  age: number;
  countryCode: string;
  countryName: string;
  schoolName?: string;
  isAmbassador: boolean;
}

export interface IScreeningAnswer {
  question: string;
  answer: string;
  score: number;
}

export interface IAnonymousScreeningSubmission extends Document {
  screening: mongoose.Types.ObjectId | string;
  totalScore: number;
  personalInfo: IPersonalInfo;
  screeningAnswers: IScreeningAnswer[];
  submittedAt: Date;
}

const ScreeningAnswerSchema: Schema = new Schema<IScreeningAnswer>({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
});

const PersonalInfoSchema: Schema = new Schema<IPersonalInfo>({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },
  age: {
    type: Number,
    required: true,
    min: 10,
    max: 25,
  },
  countryCode: {
    type: String,
    required: true,
  },
  countryName: {
    type: String,
    required: true,
  },

  schoolName: {
    type: String,
    default: null,
  },
  isAmbassador: {
    type: Boolean,
    default: false,
  },
});

const anonymousScreeningSubmissionSchema: Schema =
  new Schema<IAnonymousScreeningSubmission>(
    {
      screening: {
        type: Schema.Types.ObjectId,
        ref: "Screening",
        required: true,
      },
      totalScore: {
        type: Number,
        required: true,
      },
      personalInfo: {
        type: PersonalInfoSchema,
        required: true,
      },
      screeningAnswers: [ScreeningAnswerSchema],
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

// Add index for better query performance
anonymousScreeningSubmissionSchema.index({ email: 1, screening: 1 });
anonymousScreeningSubmissionSchema.index({ submittedAt: -1 });

export const AnonymousScreeningSubmission = mongoose.model<IAnonymousScreeningSubmission>(
  "AnonymousScreeningSubmission",
  anonymousScreeningSubmissionSchema
);
