import Screening, { IQuestion, IScreening } from "../models/ScreeningModel";
import mongoose from "mongoose";

class ScreeningService {
  async createScreening(data: Partial<IScreening>) {
    return await Screening.create(data);
  }

  async updateScreening(id: string, data: Partial<IScreening>) {
    return await Screening.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteScreening(id: string) {
    return await Screening.findByIdAndDelete(id);
  }

  async getScreeningById(id: string) {
    return await Screening.findById(id);
  }

  async getAllScreenings({
    limit = 10,
    skip = 0,
    status,
    search,
  }: {
    limit?: number;
    skip?: number;
    status?: "active" | "inactive" | "draft";
    search?: string;
  } = {}) {
    const filter: any = {};

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const screenings = await Screening.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Screening.countDocuments(filter);

    return { screenings, total };
  }

  async getScreeningBySlug(slug: string) {
    return await Screening.findOne({ slug });
  }

  async getRecentScreenings(limit: number = 5) {
    return await Screening.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async addQuestionToScreening(screeningId: string, question: Partial<IQuestion>) {
    return await Screening.findByIdAndUpdate(
      screeningId,
      { $push: { questions: question } },
      { new: true, runValidators: true }
    );
  }

  async updateQuestionInScreening(
    screeningId: string,
    questionId: string,
    updateData: Partial<IQuestion>
  ) {
    return await Screening.findOneAndUpdate(
      { _id: screeningId, "questions._id": questionId },
      { $set: { "questions.$": updateData } },
      { new: true, runValidators: true }
    );
  }

  async removeQuestionFromScreening(screeningId: string, questionId: string) {
    return await Screening.findByIdAndUpdate(
      screeningId,
      { $pull: { questions: { _id: questionId } } },
      { new: true }
    );
  }

  async changeScreeningStatus(
    screeningId: string,
    status: "active" | "inactive" | "draft"
  ) {
    return await Screening.findByIdAndUpdate(screeningId, { status }, { new: true });
  }

  async validateScreening(screeningId: string) {
    const screening = await Screening.findById(screeningId);
    if (!screening) throw new Error("Screening not found");

    const errors: string[] = [];

    if (screening.questions.length === 0) {
      errors.push("Screening must have at least one question");
    }

    screening.questions.forEach((question, index) => {
      if (question.options.length < 2) {
        errors.push(`Question ${index + 1} must have at least 2 options`);
      }
      if (question.type === "boolean" && question.options.length !== 2) {
        errors.push(`Question ${index + 1} (boolean type) must have exactly 2 options`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      screening,
    };
  }
}

export default ScreeningService;
