import {
  AnonymousScreeningSubmission,
  IAnonymousScreeningSubmission,
} from "../models/AnonymousScreeningSubmissionModel";
import mongoose from "mongoose";

class AnonymousScreeningSubmissionService {
  async createAnonymousSubmission(data: {
    screening: mongoose.Types.ObjectId | string;
    totalScore: number;
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      gender: string;
      age: number;
      countryCode: string;
      countryName: string;
      schoolId?: string;
      schoolName?: string;
      isAmbassador: boolean;
    };
    screeningAnswers: Array<{
      question: string;
      answer: string;
      score: number;
    }>;
  }) {
    const submissionData: Partial<IAnonymousScreeningSubmission> = {
      ...data,
      submittedAt: new Date(),
    };

    return await AnonymousScreeningSubmission.create(submissionData);
  }

  async updateAnonymousSubmission(
    id: string,
    data: Partial<IAnonymousScreeningSubmission>
  ) {
    return await AnonymousScreeningSubmission.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteAnonymousSubmission(id: string) {
    return await AnonymousScreeningSubmission.findByIdAndDelete(id);
  }

  async getAnonymousSubmissionById(id: string) {
    return await AnonymousScreeningSubmission.findById(id);
  }

  async getAllAnonymousSubmissions({
    limit = 10,
    skip = 0,
    screeningId,
    email,
    country,
    minScore,
    maxScore,
    isAmbassador,
  }: {
    limit?: number;
    skip?: number;
    screeningId?: string;
    email?: string;
    country?: string;
    minScore?: number;
    maxScore?: number;
    isAmbassador?: boolean;
  } = {}) {
    const filter: any = {};

    if (screeningId) filter.screening = screeningId;
    if (email) filter["personalInfo.email"] = new RegExp(email, "i");
    if (country) filter["personalInfo.countryName"] = new RegExp(country, "i");
    if (isAmbassador !== undefined) filter["personalInfo.isAmbassador"] = isAmbassador;
    if (minScore || maxScore) {
      filter.totalScore = {};
      if (minScore) filter.totalScore.$gte = minScore;
      if (maxScore) filter.totalScore.$lte = maxScore;
    }

    const submissions = await AnonymousScreeningSubmission.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ totalScore: -1, submittedAt: -1 })
      .populate("screening", "title slug");

    const total = await AnonymousScreeningSubmission.countDocuments(filter);

    return { submissions, total };
  }

  async getAllAnonymousSubmissionsForScreening(screeningId: string) {
    return await AnonymousScreeningSubmission.find({ screening: screeningId })
      .sort({ submittedAt: -1 })
      .populate("screening", "title slug");
  }
}

export default AnonymousScreeningSubmissionService;
