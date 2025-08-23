import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import ScreeningSubmissionService from "../services/ScreeningSubmissonService";
import { IScreeningSubmission } from "../models/ScreeningSubmissionModel";
import { AuthRequest } from "../types";

class ScreeningSubmissionController {
  constructor(private screeningSubmissionService: ScreeningSubmissionService) {}

  async createSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req?.auth?.sub || req?.auth?.id;
      const { screeningId, totalScore, screeningAnswers } = req.body;

      if (!screeningId || !userId || totalScore === undefined || !screeningAnswers) {
        next(createHttpError(400, "Missing required fields"));
        return;
      }

      const hasSubmitted = await this.screeningSubmissionService.hasUserSubmitted(
        userId,
        screeningId
      );

      if (hasSubmitted) {
        next(createHttpError(400, "User has already submitted for this screening"));
        return;
      }

      const submission = await this.screeningSubmissionService.createSubmission({
        screening: screeningId,
        user: userId as string,
        totalScore,
        screeningAnswers,
      });

      res.status(201).json(submission);
    } catch (error) {
      next(error);
    }
  }

  async getSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const submission = await this.screeningSubmissionService.getSubmissionById(id);
      if (!submission) {
        next(createHttpError(404, "Submission not found"));
        return;
      }
      res.status(200).json(submission);
    } catch (error) {
      next(error);
    }
  }

  async getUserSubmissionForScreening(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, screeningId } = req.params;
      const submission =
        await this.screeningSubmissionService.getUserSubmissionForScreening(
          userId,
          screeningId
        );

      if (!submission) {
        next(createHttpError(404, "Submission not found for this user and screening"));
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
        screeningId,
        userId,
        country,
        minScore,
        maxScore,
        limit = 10,
        page = 1,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const { submissions, total } =
        await this.screeningSubmissionService.getAllSubmissions({
          screeningId: screeningId as string,
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

  async getScreeningLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { screeningId } = req.params;
      const { country, ageMin, ageMax, school, limit = 100, offset = 0 } = req.query;

      const leaderboard = await this.screeningSubmissionService.getScreeningLeaderboard(
        screeningId,
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

  async getScreeningStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { screeningId } = req.params;
      const stats = await this.screeningSubmissionService.getScreeningStatistics(
        screeningId
      );
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  async updateSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: Partial<IScreeningSubmission> = req.body;

      const submission = await this.screeningSubmissionService.updateSubmission(id, data);
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
      const submission = await this.screeningSubmissionService.deleteSubmission(id);
      if (!submission) {
        throw createHttpError(404, "Submission not found");
      }

      res.status(200).json(submission);
    } catch (error) {
      next(error);
    }
  }
}

export default ScreeningSubmissionController;
