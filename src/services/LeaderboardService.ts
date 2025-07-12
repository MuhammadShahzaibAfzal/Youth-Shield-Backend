import mongoose from "mongoose";
import NodeCache from "node-cache";
import { ContestSubmission } from "../models/ContestSubmissionModel";
import { ScreeningSubmission } from "../models/ScreeningSubmissionModel";
import User from "../models/UserModel";
import logger from "../config/logger";

interface LeaderboardUser {
  _id: string;
  name: string;
  points: number;
  rank: number;
  imageURL: string;
  country: string;
  countryCode: string;
  school: string;
  schoolId: string;
  age?: number;
}

interface FilterOptions {
  country?: string;
  school?: mongoose.Types.ObjectId | string;
  contest?: mongoose.Types.ObjectId | string;
  screening?: mongoose.Types.ObjectId | string;
  limit?: number;
  offset?: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  totalParticipants: number;
  totalSchools: number;
  totalCountries: number;
  updatedAt: Date;
}

class LeaderboardService {
  private cache: NodeCache;
  private cacheTTL = 60 * 60; // 60 minutes
  private refreshInterval?: NodeJS.Timeout;
  private updatedAt: Date = new Date();

  constructor() {
    this.cache = new NodeCache({
      stdTTL: this.cacheTTL,
      useClones: false, // Better performance for large objects
    });
    this.initializeCacheRefresh();
  }

  private initializeCacheRefresh(): void {
    this.refreshCache();
    this.refreshInterval = setInterval(() => {
      logger.info("Auto-refreshing cache at", new Date().toISOString());
      this.refreshCache().catch((err) => {
        logger.error("Periodic refresh failed:", err);
      });
      this.updatedAt = new Date();
    }, this.cacheTTL * 1000);
  }

  private async refreshCache(): Promise<void> {
    try {
      console.log("Refreshing leaderboard caches...");

      // Refresh global leaderboard
      const globalLeaderboard = await this.calculateGlobalLeaderboard();
      this.cache.set("global", globalLeaderboard);

      // Refresh statistics
      await this.refreshStatisticsCache(globalLeaderboard);

      // Refresh contest leaderboards
      const contestIds = await ContestSubmission.distinct("contest");
      await Promise.all(
        contestIds.map(async (contestId) => {
          const contestKey = `contest-${contestId}`;
          const contestLeaderboard = await this.calculateContestLeaderboard(contestId);
          this.cache.set(contestKey, contestLeaderboard);
        })
      );

      // Refresh screening leaderboards
      const screeningIds = await ScreeningSubmission.distinct("screening");
      await Promise.all(
        screeningIds.map(async (screeningId) => {
          const screeningKey = `screening-${screeningId}`;
          const screeningLeaderboard = await this.calculateScreeningLeaderboard(
            screeningId
          );
          this.cache.set(screeningKey, screeningLeaderboard);
        })
      );

      console.log("All leaderboard caches refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh leaderboard caches:", error);
    }
  }

  private async calculateGlobalLeaderboard(): Promise<LeaderboardUser[]> {
    const [contestSubmissions, screeningSubmissions] = await Promise.all([
      ContestSubmission.find().lean(),
      ScreeningSubmission.find().lean(),
    ]);

    const userPointsMap = new Map<
      string,
      { points: number; userId: mongoose.Types.ObjectId }
    >();

    // Process all submissions
    [...contestSubmissions, ...screeningSubmissions].forEach((submission) => {
      const userId = submission.user.toString();
      const current = userPointsMap.get(userId) || { points: 0, userId: submission.user };
      current.points += submission.totalScore;
      userPointsMap.set(userId, current as any);
    });

    return this.createLeaderboardFromMap(userPointsMap);
  }

  private async calculateContestLeaderboard(
    contestId: mongoose.Types.ObjectId | string
  ): Promise<LeaderboardUser[]> {
    const submissions = await ContestSubmission.find({ contest: contestId })
      .sort({ totalScore: -1 })
      .lean();

    const userPointsMap = new Map<
      string,
      { points: number; userId: mongoose.Types.ObjectId }
    >();

    submissions.forEach((submission) => {
      const userId = submission.user.toString();
      userPointsMap.set(userId, {
        points: submission.totalScore,
        userId: submission.user as mongoose.Types.ObjectId,
      });
    });

    return this.createLeaderboardFromMap(userPointsMap);
  }

  private async calculateScreeningLeaderboard(
    screeningId: mongoose.Types.ObjectId | string
  ): Promise<LeaderboardUser[]> {
    const submissions = await ScreeningSubmission.find({ screening: screeningId })
      .sort({ totalScore: -1 })
      .lean();

    const userPointsMap = new Map<
      string,
      { points: number; userId: mongoose.Types.ObjectId }
    >();

    submissions.forEach((submission) => {
      const userId = submission.user.toString();
      userPointsMap.set(userId, {
        points: submission.totalScore,
        userId: submission.user as mongoose.Types.ObjectId,
      });
    });

    return this.createLeaderboardFromMap(userPointsMap);
  }

  private async createLeaderboardFromMap(
    userPointsMap: Map<string, { points: number; userId: mongoose.Types.ObjectId }>
  ): Promise<LeaderboardUser[]> {
    const userIds = Array.from(userPointsMap.values()).map((item) => item.userId);
    const users = await User.find(
      { _id: { $in: userIds } },
      {
        firstName: 1,
        lastName: 1,
        imageURL: 1,
        country: 1,
        countryCode: 1,
        highSchool: 1,
        age: 1,
      }
    )
      .populate("highSchool", "name _id")
      .lean();

    const userDetailsMap = new Map<string, any>();
    users.forEach((user) => {
      userDetailsMap.set(user._id.toString(), user);
    });

    const leaderboard = Array.from(userPointsMap.entries())
      .map(([userId, { points }]) => {
        const userDetails = userDetailsMap.get(userId) || {};
        return {
          _id: userId,
          name:
            `${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim() ||
            "Unknown",
          points,
          rank: 0,
          imageURL: userDetails.imageURL || "",
          country: userDetails.country || "",
          countryCode: userDetails.countryCode || "",
          school: userDetails.highSchool?.name || "",
          schoolId: userDetails.highSchool?._id.toString() || "",
          age: userDetails.age,
        };
      })
      .sort((a, b) => b.points - a.points);

    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    return leaderboard;
  }

  private async refreshStatisticsCache(leaderboard: LeaderboardUser[]): Promise<void> {
    try {
      // Calculate unique schools and countries
      const schools = new Set<string>();
      const countries = new Set<string>();

      leaderboard.forEach((user) => {
        if (user.schoolId) schools.add(user.schoolId);
        if (user.country) countries.add(user.country);
      });

      // Cache the statistics with longer TTL
      this.cache.set("stats:totalParticipants", leaderboard.length, this.cacheTTL);
      this.cache.set("stats:totalSchools", schools.size, this.cacheTTL);
      this.cache.set("stats:totalCountries", countries.size, this.cacheTTL);

      logger.info("Statistics cache refreshed");
    } catch (error) {
      logger.error("Failed to refresh statistics cache:", error);
    }
  }

  private getCacheKey(filters: FilterOptions): string {
    const parts = ["leaderboard"];
    if (filters.country) parts.push(`country-${filters.country}`);
    if (filters.school) parts.push(`school-${filters.school}`);
    if (filters.contest) parts.push(`contest-${filters.contest}`);
    if (filters.screening) parts.push(`screening-${filters.screening}`);
    return parts.join(":");
  }

  private async getStatistics(): Promise<{
    totalParticipants: number;
    totalSchools: number;
    totalCountries: number;
  }> {
    // Try to get from cache first
    const totalParticipants = this.cache.get<number>("stats:totalParticipants") ?? 0;
    const totalSchools = this.cache.get<number>("stats:totalSchools") ?? 0;
    const totalCountries = this.cache.get<number>("stats:totalCountries") ?? 0;

    // If any stat is missing, recalculate
    if (totalParticipants === 0 || totalSchools === 0 || totalCountries === 0) {
      const globalLeaderboard =
        this.cache.get<LeaderboardUser[]>("global") ||
        (await this.calculateGlobalLeaderboard());
      await this.refreshStatisticsCache(globalLeaderboard);
      return {
        totalParticipants: globalLeaderboard.length,
        totalSchools: new Set(globalLeaderboard.map((u) => u.schoolId)).size - 1,
        totalCountries: new Set(globalLeaderboard.map((u) => u.country)).size - 1,
      };
    }

    return { totalParticipants, totalSchools, totalCountries };
  }

  public async getLeaderboard(filters: FilterOptions = {}): Promise<LeaderboardResponse> {
    const cacheKey = this.getCacheKey(filters);
    let cached = this.cache.get<LeaderboardUser[]>(cacheKey);

    if (!cached) {
      let baseLeaderboard: LeaderboardUser[];

      if (filters.contest) {
        const contestKey = `contest-${filters.contest}`;
        baseLeaderboard =
          this.cache.get<LeaderboardUser[]>(contestKey) ||
          (await this.calculateContestLeaderboard(filters.contest));
      } else if (filters.screening) {
        const screeningKey = `screening-${filters.screening}`;
        baseLeaderboard =
          this.cache.get<LeaderboardUser[]>(screeningKey) ||
          (await this.calculateScreeningLeaderboard(filters.screening));
      } else {
        baseLeaderboard =
          this.cache.get<LeaderboardUser[]>("global") ||
          (await this.calculateGlobalLeaderboard());
      }

      cached = this.applyAdditionalFilters(baseLeaderboard, filters);
      this.cache.set(cacheKey, cached);
    }

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || cached.length;
    const result = cached.slice(offset, offset + limit);
    const { totalCountries, totalParticipants, totalSchools } =
      await this.getStatistics();
    return {
      leaderboard: result,
      totalParticipants: totalParticipants,
      updatedAt: this.updatedAt,
      totalCountries,
      totalSchools,
    };
  }

  private applyAdditionalFilters(
    leaderboard: LeaderboardUser[],
    filters: FilterOptions
  ): LeaderboardUser[] {
    let filtered = [...leaderboard];

    if (filters.country) {
      filtered = filtered.filter((user) => user.country === filters.country);
    }

    if (filters.school) {
      filtered = filtered.filter((user) => user.schoolId === filters.school?.toString());
    }

    // Recalculate ranks after filtering
    filtered.sort((a, b) => b.points - a.points);
    filtered.forEach((user, index) => {
      user.rank = index + 1;
    });

    return filtered;
  }

  public async forceRefreshCache(): Promise<void> {
    await this.refreshCache();
  }

  // Method to update cache when new submissions are added
  public async handleNewSubmission(
    type: "contest" | "screening",
    submissionId: mongoose.Types.ObjectId
  ): Promise<void> {
    if (type === "contest") {
      const submission = await ContestSubmission.findById(submissionId).lean();
      if (submission) {
        await this.updateContestLeaderboardCache(submission.contest);
      }
    } else {
      const submission = await ScreeningSubmission.findById(submissionId).lean();
      if (submission) {
        await this.updateScreeningLeaderboardCache(submission.screening);
      }
    }
    // Also refresh global leaderboard
    const globalLeaderboard = await this.calculateGlobalLeaderboard();
    this.cache.set("global", globalLeaderboard);
  }

  private async updateContestLeaderboardCache(
    contestId: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const contestKey = `contest-${contestId}`;
    const contestLeaderboard = await this.calculateContestLeaderboard(contestId);
    this.cache.set(contestKey, contestLeaderboard);
  }

  private async updateScreeningLeaderboardCache(
    screeningId: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const screeningKey = `screening-${screeningId}`;
    const screeningLeaderboard = await this.calculateScreeningLeaderboard(screeningId);
    this.cache.set(screeningKey, screeningLeaderboard);
  }
}

export default LeaderboardService;
