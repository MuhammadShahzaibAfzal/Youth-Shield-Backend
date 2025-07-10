import mongoose, { Document, Schema } from "mongoose";

export interface IScreeningSubmission extends Document {
  screening: mongoose.Types.ObjectId | string;
  user: mongoose.Types.ObjectId | string;
  totalScore: number;
  submittedAt: Date;

  userDemographics: {
    country: string;
    school?: mongoose.Types.ObjectId | string;
  };
}

const screeningSubmissionSchema: Schema = new Schema<IScreeningSubmission>(
  {
    screening: {
      type: Schema.Types.ObjectId,
      ref: "Screening",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    totalScore: {
      type: Number,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    userDemographics: {
      country: { type: String, required: true },
      school: { type: Schema.Types.ObjectId, ref: "School" },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique submission per screening per user
screeningSubmissionSchema.index({ screening: 1, user: 1 }, { unique: true });

// Indexes for leaderboard-like queries
screeningSubmissionSchema.index({ screening: 1, totalScore: -1 });
screeningSubmissionSchema.index({ "userDemographics.country": 1, totalScore: -1 });

export const ScreeningSubmission = mongoose.model<IScreeningSubmission>(
  "ScreeningSubmission",
  screeningSubmissionSchema
);
