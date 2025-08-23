import { NextFunction, Request, Response } from "express";
import { FileStorage } from "../types/storage";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import createHttpError from "http-errors";
import ScreeningService from "../services/ScreeningService";
import { AuthRequest } from "../types";
import ScreeningSubmissionService from "../services/ScreeningSubmissonService";

class ScreeningController {
  constructor(
    private storage: FileStorage,
    private screeningService: ScreeningService,
    private screeningSubmissionService: ScreeningSubmissionService
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

      const screening = await this.screeningService.createScreening({
        ...req.body,
        imageURL: imageURL,
        questions: req.body.questions ? JSON.parse(req.body.questions) : [],
        benefits: req.body.benefits ? JSON.parse(req.body.benefits) : [],
      });

      res.status(201).json(screening);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, limit = 10, page = 1 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const { screenings, total } = await this.screeningService.getAllScreenings({
        status: status as "active" | "inactive" | "draft",
        search: search as string,
        limit: Number(limit),
        skip,
      });

      res.status(200).json({
        screenings,
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
      const screening = await this.screeningService.getScreeningById(id);
      if (!screening) {
        return next(createHttpError(404, "Screening not found"));
      }
      res.status(200).json(screening);
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userID = req?.auth?.sub || req?.auth?.id;
      const { slug } = req.params;
      const screening = await this.screeningService.getScreeningBySlug(slug);
      if (!screening) {
        return next(createHttpError(404, "Screening not found"));
      }
      const isAlreadySubmitted = await this.screeningSubmissionService.hasUserSubmitted(
        userID as string,
        screening._id as string
      );

      res.status(200).json({
        ...screening.toObject(),
        isAlreadySubmitted,
        translations: screening?.translations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnonymousBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const screening = await this.screeningService.getScreeningBySlug(slug);
      if (!screening) {
        return next(createHttpError(404, "Screening not found"));
      }

      res.status(200).json({
        ...screening.toObject(),
        translations: screening?.translations,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const screeningExist = await this.screeningService.getScreeningById(id);
      if (!screeningExist) {
        return next(createHttpError(404, "Screening not found"));
      }

      let imageURL = screeningExist.imageURL;
      const image = req.files?.image as UploadedFile;
      if (image) {
        const imageName = uuidv4();
        imageURL = await this.storage.upload({
          fileName: imageName,
          fileData: image.data.buffer,
          contentType: image.mimetype,
        });
      }

      const screening = await this.screeningService.updateScreening(id, {
        ...req.body,
        imageURL,
        questions: req.body.questions
          ? JSON.parse(req.body.questions)
          : screeningExist.questions,
        interpretations: req.body.interpretations
          ? JSON.parse(req.body.interpretations)
          : screeningExist.interpretations,

        benefits: req.body.benefits
          ? JSON.parse(req.body.benefits)
          : screeningExist.benefits,
      });

      res.status(200).json(screening);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const screening = await this.screeningService.deleteScreening(id);
      if (!screening) {
        return next(createHttpError(404, "Screening not found"));
      }
      res.status(200).json(screening);
    } catch (error) {
      next(error);
    }
  }

  async getRecentScreenings(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 5 } = req.query;
      const screenings = await this.screeningService.getRecentScreenings(Number(limit));
      res.status(200).json(screenings);
    } catch (error) {
      next(error);
    }
  }
}

export default ScreeningController;
