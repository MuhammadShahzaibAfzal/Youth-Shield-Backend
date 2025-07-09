import { ContestSubmission, IContestSubmission } from "../models/ContestSubmissionModel";
import mongoose from "mongoose";
import User from "../models/UserModel";

class ContestSubmissionService {
  async createSubmission(data: {
    contest: mongoose.Types.ObjectId | string;
    user: mongoose.Types.ObjectId | string;
    totalScore: number;
  }) {
    // Get user demographics at time of submission
    const user = await User.findById(data.user);
    if (!user) {
      throw new Error("User not found");
    }

    const submissionData: Partial<IContestSubmission> = {
      ...data,
      userDemographics: {
        country: user.country || "Unknown",
        school: user.highSchool || "Unknown",
      },
      submittedAt: new Date(),
    };

    return await ContestSubmission.create(submissionData);
  }

  async updateSubmission(id: string, data: Partial<IContestSubmission>) {
    return await ContestSubmission.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteSubmission(id: string) {
    return await ContestSubmission.findByIdAndDelete(id);
  }

  async getSubmissionById(id: string) {
    return await ContestSubmission.findById(id);
  }

  async getAllSubmissions({
    limit = 10,
    skip = 0,
    contestId,
    userId,
    country,
    minScore,
    maxScore,
  }: {
    limit?: number;
    skip?: number;
    contestId?: string;
    userId?: string;
    country?: string;
    minScore?: number;
    maxScore?: number;
  } = {}) {
    const filter: any = {};

    if (contestId) filter.contest = contestId;
    if (userId) filter.user = userId;
    if (country) filter["userDemographics.country"] = country;
    if (minScore || maxScore) {
      filter.totalScore = {};
      if (minScore) filter.totalScore.$gte = minScore;
      if (maxScore) filter.totalScore.$lte = maxScore;
    }

    const submissions = await ContestSubmission.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ totalScore: -1, submittedAt: 1 })
      .populate("user", "firstName lastName")
      .populate("contest", "name slug");

    const total = await ContestSubmission.countDocuments(filter);

    return { submissions, total };
  }

  async getAll() {
    return await ContestSubmission.find({})
      .sort({ submittedAt: -1 })
      .populate("user", "firstName lastName imageURL")
      .populate("contest", "name slug");
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

    // Apply filters if provided
    if (countryFilter) {
      matchStage["userDemographics.country"] = countryFilter;
    }

    if (schoolFilter) {
      matchStage["userDemographics.school"] = new mongoose.Types.ObjectId(schoolFilter);
    }

    const pipeline: any[] = [
      // First match stage for contest submissions
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
      {
        $unwind: "$user",
      },
      // Second match stage for user fields if searchTerm is provided
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
      // Lookup school information
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
      {
        $sort: { totalScore: -1 },
      },
      {
        $limit: 10,
      },
    ];

    return await ContestSubmission.aggregate(pipeline);
  }

  /**
   * Get a user's submission for a specific contest
   */
  async getUserSubmissionForContest(userId: string, contestId: string) {
    return await ContestSubmission.findOne({
      user: userId,
      contest: contestId,
    });
  }

  /**
   * Get leaderboard for a specific contest
   */
  async getContestLeaderboard(
    contestId: string,
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

    const query: any = { contest: contestId };

    // Apply filters
    if (filters.country) query["userDemographics.country"] = filters.country;
    if (filters.ageMin || filters.ageMax) {
      query["userDemographics.age"] = {};
      if (filters.ageMin) query["userDemographics.age"].$gte = filters.ageMin;
      if (filters.ageMax) query["userDemographics.age"].$lte = filters.ageMax;
    }
    if (filters.school) query["userDemographics.school"] = filters.school;

    const submissions = await ContestSubmission.find(query)
      .sort({ totalScore: -1, submittedAt: 1 })
      .skip(offset)
      .limit(limit)
      .populate("user", "firstName lastName imageURL");

    const totalParticipants = await ContestSubmission.countDocuments({
      contest: contestId,
    });

    // Calculate ranks and percentiles
    const allSubmissionsCount = await ContestSubmission.countDocuments(query);
    const leaderboard = submissions.map((sub, index) => ({
      ...sub.toObject(),
      rank: offset + index + 1,
      percentile: Math.round(((offset + index) / allSubmissionsCount) * 100),
    }));

    return {
      leaderboard,
      totalParticipants,
      filteredCount: allSubmissionsCount,
    };
  }

  /**
   * Get statistics for a contest
   */
  async getContestStatistics(contestId: string) {
    const stats = await ContestSubmission.aggregate([
      { $match: { contest: new mongoose.Types.ObjectId(contestId) } },
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

    const countryDistribution = await ContestSubmission.aggregate([
      { $match: { contest: new mongoose.Types.ObjectId(contestId) } },
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

  /**
   * Check if a user has already submitted for a contest
   */
  async hasUserSubmitted(userId: string, contestId: string) {
    const count = await ContestSubmission.countDocuments({
      user: userId,
      contest: contestId,
    });
    return count > 0;
  }
}

export default ContestSubmissionService;
