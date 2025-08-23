import { NextFunction, Request, Response } from "express";
import AnonymousScreeningSubmissionService from "../services/AnonymousScreeningSubmissionService";

class AnonymousScreeningSubmissionController {
  constructor(
    private anonymousScreeningSubmissionService: AnonymousScreeningSubmissionService
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const submission =
        await this.anonymousScreeningSubmissionService.createAnonymousSubmission(data);
      res.status(201).json({
        id: submission._id,
        message: "Submission created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        screeningId,
        country,
        minScore,
        maxScore,
        limit = 10,
        page = 1,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const { submissions, total } =
        await this.anonymousScreeningSubmissionService.getAllAnonymousSubmissions({
          screeningId: screeningId as string,
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

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const submission =
        await this.anonymousScreeningSubmissionService.getAnonymousSubmissionById(id);
      res.status(200).json(submission);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const submission =
        await this.anonymousScreeningSubmissionService.deleteAnonymousSubmission(id);
      res.status(200).json(submission);
    } catch (error) {
      next(error);
    }
  }
}

export default AnonymousScreeningSubmissionController;
