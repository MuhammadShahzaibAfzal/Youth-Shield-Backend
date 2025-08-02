import mongoose, { Schema, Document } from "mongoose";

export interface IResearchRegistration extends Document {
  firstName: string;
  language: string;
  grade: string;
  highSchool: string;
  country: {
    name: string;
    code: string;
  };
  city: string;
  selectedResearch: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const researchResearchSchema: Schema<IResearchRegistration> = new Schema(
  {
    firstName: { type: String, required: true },
    language: { type: String, required: true },
    grade: { type: String, required: true },
    highSchool: {
      type: String,
      required: true,
    },
    country: {
      name: { type: String, required: true },
      code: { type: String, required: true },
    },
    city: { type: String, required: true },
    selectedResearch: { type: String, required: true },
  },
  { timestamps: true }
);

const ResearchRegistration = mongoose.model<IResearchRegistration>(
  "ResearchRegistration",
  researchResearchSchema
);

export default ResearchRegistration;
