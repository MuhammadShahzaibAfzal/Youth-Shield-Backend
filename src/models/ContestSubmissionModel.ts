import mongoose, { Document, Schema } from "mongoose";

export interface IContestSubmission extends Document {
  contest: mongoose.Types.ObjectId | string;
  user: mongoose.Types.ObjectId | string;
  totalScore: number;
  submittedAt: Date;

  userDemographics: {
    country: string;
    school?: mongoose.Types.ObjectId | string;
  };
  //   timeTaken: number; // in seconds
}

const contestSubmissionSchema: Schema = new Schema<IContestSubmission>(
  {
    contest: {
      type: Schema.Types.ObjectId,
      ref: "Contest",
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
    // timeTaken: {
    //   type: Number,
    //   required: true,
    //   comment: "Time taken in seconds",
    // },
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

contestSubmissionSchema.index({ contest: 1, user: 1 }, { unique: true });
contestSubmissionSchema.index({ contest: 1, totalScore: -1 });
contestSubmissionSchema.index({ "userDemographics.country": 1, totalScore: -1 });
contestSubmissionSchema.index({ "userDemographics.age": 1, totalScore: -1 });

export const ContestSubmission = mongoose.model<IContestSubmission>(
  "ContestSubmission",
  contestSubmissionSchema
);
