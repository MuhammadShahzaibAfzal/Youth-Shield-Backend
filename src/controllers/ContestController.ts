import { NextFunction, Request, Response } from "express";
import { FileStorage } from "../types/storage";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import createHttpError from "http-errors";
import ContestService from "../services/ContestService";
import { AuthRequest } from "../types";
import ContestSubmissionService from "../services/ContestSubmissionService";

class ContestController {
  constructor(
    private storage: FileStorage,
    private contestService: ContestService,
    private contestSubmissionService: ContestSubmissionService
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      let imageURL = null;
      const image = req.files?.image as UploadedFile;
      if (image) {
        const imageName = uuidv4();
        imageURL = await this.storage.upload({
          fileName: imageName,
          fileData: image.data.buffer,
          contentType: image.mimetype,
        });
      }

      const contest = await this.contestService.createContest({
        ...req.body,
        imageURL: imageURL,
        questions: req.body.questions ? JSON.parse(req.body.questions) : [],
      });

      res.status(201).json(contest);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, limit = 10, page = 1 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const { contests, total } = await this.contestService.getAllContests({
        status: status as "active" | "inactive",
        search: search as string,
        limit: Number(limit),
        skip,
      });

      res.status(200).json({
        contests,
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
      const contest = await this.contestService.getContestById(id);
      if (!contest) {
        return next(createHttpError(404, "Contest not found"));
      }
      res.status(200).json(contest);
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userID = req?.auth?.sub || req?.auth?.id;
      const { slug } = req.params;

      const contest = await this.contestService.getContestBySlug(slug);
      if (!contest) {
        return next(createHttpError(404, "Contest not found"));
      }
      const isAlreadySubmitted = await this.contestSubmissionService.hasUserSubmitted(
        userID as string,
        contest._id as string
      );

      res.status(200).json({
        ...contest.toObject(),
        isAlreadySubmitted,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const contestExist = await this.contestService.getContestById(id);
      if (!contestExist) {
        return next(createHttpError(404, "Contest not found"));
      }

      let imageURL = contestExist.imageURL;
      const image = req.files?.image as UploadedFile;
      if (image) {
        const imageName = uuidv4();
        imageURL = await this.storage.upload({
          fileName: imageName,
          fileData: image.data.buffer,
          contentType: image.mimetype,
        });
      }

      const contest = await this.contestService.updateContest(id, {
        ...req.body,
        imageURL,
        questions: req.body.questions
          ? JSON.parse(req.body.questions)
          : contestExist.questions,
      });

      res.status(200).json(contest);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const contest = await this.contestService.deleteContest(id);
      if (!contest) {
        return next(createHttpError(404, "Contest not found"));
      }
      res.status(200).json(contest);
    } catch (error) {
      next(error);
    }
  }

  async getRecentContests(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 5 } = req.query;
      const contests = await this.contestService.getRecentContests(Number(limit));
      res.status(200).json(contests);
    } catch (error) {
      next(error);
    }
  }

  async getActiveContests(req: Request, res: Response, next: NextFunction) {
    try {
      const contests = await this.contestService.getActiveContests();
      res.status(200).json(contests);
    } catch (error) {
      next(error);
    }
  }
}

export default ContestController;
