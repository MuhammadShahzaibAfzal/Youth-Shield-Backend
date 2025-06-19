import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import ContestSubmissionService from "../services/ContestSubmissionService";
import { IContestSubmission } from "../models/ContestSubmissionModel";
import { AuthRequest } from "../types";

class ContestSubmissionController {
  constructor(private contestSubmissionService: ContestSubmissionService) {}

  async createSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req?.auth?.sub || req?.auth?.id;
      const { contestId, totalScore } = req.body;

      if (!contestId || !userId || totalScore === undefined) {
        next(createHttpError(400, "Missing required fields"));
        return;
      }

      // Check if user already submitted
      const hasSubmitted = await this.contestSubmissionService.hasUserSubmitted(
        userId,
        contestId
      );
      if (hasSubmitted) {
        next(createHttpError(400, "User has already submitted for this contest"));
        return;
      }

      const submission = await this.contestSubmissionService.createSubmission({
        contest: contestId,
        user: userId as string,
        totalScore,
      });

      res.status(201).json(submission);
    } catch (error) {
      next(error);
    }
  }

  async getSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const submission = await this.contestSubmissionService.getSubmissionById(id);
      if (!submission) {
        next(createHttpError(404, "Submission not found"));
        return;
      }
      res.status(200).json(submission);
    } catch (error) {
      next(error);
    }
  }

  async getUserSubmissionForContest(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, contestId } = req.params;
      const submission = await this.contestSubmissionService.getUserSubmissionForContest(
        userId,
        contestId
      );
      if (!submission) {
        next(createHttpError(404, "Submission not found for this user and contest"));
        return;
      }
      res.status(200).json(submission);
    } catch (error) {
      next(error);
    }
  }

  async getAllSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        contestId,
        userId,
        country,
        minScore,
        maxScore,
        limit = 10,
        page = 1,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const { submissions, total } =
        await this.contestSubmissionService.getAllSubmissions({
          contestId: contestId as string,
          userId: userId as string,
          country: country as string,
          minScore: minScore ? Number(minScore) : undefined,
          maxScore: maxScore ? Number(maxScore) : undefined,
          limit: Number(limit),
          skip,
        });

      res.status(200).json({
        submissions,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getContestLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { contestId } = req.params;
      const { country, ageMin, ageMax, school, limit = 100, offset = 0 } = req.query;

      const leaderboard = await this.contestSubmissionService.getContestLeaderboard(
        contestId,
        {
          country: country as string,
          ageMin: ageMin ? Number(ageMin) : undefined,
          ageMax: ageMax ? Number(ageMax) : undefined,
          school: school as string,
          limit: Number(limit),
          offset: Number(offset),
        }
      );

      res.status(200).json(leaderboard);
    } catch (error) {
      next(error);
    }
  }

  async getContestStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { contestId } = req.params;
      const stats = await this.contestSubmissionService.getContestStatistics(contestId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  async updateSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: Partial<IContestSubmission> = req.body;

      const submission = await this.contestSubmissionService.updateSubmission(id, data);
      if (!submission) {
        throw createHttpError(404, "Submission not found");
      }
      res.status(200).json(submission);
    } catch (error) {
      next(error);
    }
  }

  async deleteSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const submission = await this.contestSubmissionService.deleteSubmission(id);
      if (!submission) {
        throw createHttpError(404, "Submission not found");
      }
      res.status(200).json(submission);
    } catch (error) {
      next(error);
    }
  }
}

export default ContestSubmissionController;
