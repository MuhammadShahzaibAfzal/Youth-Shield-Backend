import {
  ScreeningSubmission,
  IScreeningSubmission,
} from "../models/ScreeningSubmissionModel";
import mongoose from "mongoose";
import User from "../models/UserModel";

class ScreeningSubmissionService {
  async createSubmission(data: {
    screening: mongoose.Types.ObjectId | string;
    user: mongoose.Types.ObjectId | string;
    totalScore: number;
  }) {
    const user = await User.findById(data.user);
    if (!user) throw new Error("User not found");

    const submissionData: Partial<IScreeningSubmission> = {
      ...data,
      userDemographics: {
        country: user.country || "Unknown",
        school: user.highSchool || "Unknown",
      },
      submittedAt: new Date(),
    };

    return await ScreeningSubmission.create(submissionData);
  }

  async updateSubmission(id: string, data: Partial<IScreeningSubmission>) {
    return await ScreeningSubmission.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteSubmission(id: string) {
    return await ScreeningSubmission.findByIdAndDelete(id);
  }

  async getSubmissionById(id: string) {
    return await ScreeningSubmission.findById(id);
  }

  async getAllSubmissions({
    limit = 10,
    skip = 0,
    screeningId,
    userId,
    country,
    minScore,
    maxScore,
  }: {
    limit?: number;
    skip?: number;
    screeningId?: string;
    userId?: string;
    country?: string;
    minScore?: number;
    maxScore?: number;
  } = {}) {
    const filter: any = {};

    if (screeningId) filter.screening = screeningId;
    if (userId) filter.user = userId;
    if (country) filter["userDemographics.country"] = country;
    if (minScore || maxScore) {
      filter.totalScore = {};
      if (minScore) filter.totalScore.$gte = minScore;
      if (maxScore) filter.totalScore.$lte = maxScore;
    }

    const submissions = await ScreeningSubmission.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ totalScore: -1, submittedAt: 1 })
      .populate("user", "firstName lastName")
      .populate("screening", "title slug");

    const total = await ScreeningSubmission.countDocuments(filter);

    return { submissions, total };
  }

  async getAll() {
    return await ScreeningSubmission.find({})
      .sort({ submittedAt: -1 })
      .populate("user", "firstName lastName imageURL")
      .populate("screening", "title slug");
  }

  async aggregateTotalScores({
    searchTerm,
    countryFilter,
    schoolFilter,
  }: {
    searchTerm?: string;
    countryFilter?: string;
    schoolFilter?: string;
  }) {
    const matchStage: any = {};

    if (countryFilter) {
      matchStage["userDemographics.country"] = countryFilter;
    }

    if (schoolFilter) {
      matchStage["userDemographics.school"] = new mongoose.Types.ObjectId(schoolFilter);
    }

    const pipeline: any[] = [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$totalScore" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      ...(searchTerm
        ? [
            {
              $match: {
                $or: [
                  { "user.firstName": { $regex: searchTerm, $options: "i" } },
                  { "user.lastName": { $regex: searchTerm, $options: "i" } },
                ],
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: "schools",
          localField: "user.highSchool",
          foreignField: "_id",
          as: "school",
        },
      },
      {
        $unwind: {
          path: "$school",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          totalScore: 1,
          "user.firstName": 1,
          "user.lastName": 1,
          "user.imageURL": 1,
          "user.country": 1,
          "user.countryCode": 1,
          "school.name": 1,
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
    ];

    return await ScreeningSubmission.aggregate(pipeline);
  }

  async getUserSubmissionForScreening(userId: string, screeningId: string) {
    return await ScreeningSubmission.findOne({
      user: userId,
      screening: screeningId,
    });
  }

  async getScreeningLeaderboard(
    screeningId: string,
    options: {
      limit?: number;
      offset?: number;
      country?: string;
      ageMin?: number;
      ageMax?: number;
      school?: string;
    } = {}
  ) {
    const { limit = 100, offset = 0, ...filters } = options;
    const query: any = { screening: screeningId };

    if (filters.country) query["userDemographics.country"] = filters.country;
    if (filters.ageMin || filters.ageMax) {
      query["userDemographics.age"] = {};
      if (filters.ageMin) query["userDemographics.age"].$gte = filters.ageMin;
      if (filters.ageMax) query["userDemographics.age"].$lte = filters.ageMax;
    }
    if (filters.school) query["userDemographics.school"] = filters.school;

    const submissions = await ScreeningSubmission.find(query)
      .sort({ totalScore: -1, submittedAt: 1 })
      .skip(offset)
      .limit(limit)
      .populate("user", "firstName lastName imageURL");

    const totalParticipants = await ScreeningSubmission.countDocuments({
      screening: screeningId,
    });

    const filteredCount = await ScreeningSubmission.countDocuments(query);

    const leaderboard = submissions.map((sub, index) => ({
      ...sub.toObject(),
      rank: offset + index + 1,
      percentile: Math.round(((offset + index) / filteredCount) * 100),
    }));

    return {
      leaderboard,
      totalParticipants,
      filteredCount,
    };
  }

  async getScreeningStatistics(screeningId: string) {
    const stats = await ScreeningSubmission.aggregate([
      { $match: { screening: new mongoose.Types.ObjectId(screeningId) } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$totalScore" },
          highestScore: { $max: "$totalScore" },
          lowestScore: { $min: "$totalScore" },
          totalSubmissions: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          averageScore: { $round: ["$averageScore", 2] },
          highestScore: 1,
          lowestScore: 1,
          totalSubmissions: 1,
        },
      },
    ]);

    const countryDistribution = await ScreeningSubmission.aggregate([
      { $match: { screening: new mongoose.Types.ObjectId(screeningId) } },
      {
        $group: {
          _id: "$userDemographics.country",
          count: { $sum: 1 },
          averageScore: { $avg: "$totalScore" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          country: "$_id",
          count: 1,
          averageScore: { $round: ["$averageScore", 2] },
          _id: 0,
        },
      },
    ]);

    return {
      ...(stats[0] || {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalSubmissions: 0,
      }),
      countryDistribution,
    };
  }

  async hasUserSubmitted(userId: string, screeningId: string) {
    const count = await ScreeningSubmission.countDocuments({
      user: userId,
      screening: screeningId,
    });
    return count > 0;
  }
}

export default ScreeningSubmissionService;
