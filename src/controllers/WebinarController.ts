import { NextFunction, Request, Response } from "express";
import { FileStorage } from "../types/storage";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import createHttpError from "http-errors";
import WebinarService from "../services/WebinarService";
import { startOfDay } from "date-fns";

class WebinarController {
  constructor(private storage: FileStorage, private webinarService: WebinarService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const image = req.files?.image as UploadedFile;
      if (!image) {
        return next(createHttpError(400, "No image uploaded"));
      }

      const imageName = uuidv4();
      const url = await this.storage.upload({
        fileName: imageName,
        fileData: image.data.buffer,
        contentType: image.mimetype,
      });

      const webinar = await this.webinarService.createWebinar({
        ...req.body,
        image: url,
        date: startOfDay(new Date(req.body.date)),
      });
      res.status(201).json(webinar);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const webinars = await this.webinarService.getAllWebinars();
      res.status(200).json({ webinars });
    } catch (error) {
      next(error);
    }
  }

  async getPaginated(req: Request, res: Response, next: NextFunction) {
    const { limit, page } = req.query;
    try {
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      const { webinars, total } = await this.webinarService.getPaginatedWebinars({
        skip,
        limit: limitNumber,
      });

      res.status(200).json({
        webinars,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        limit: limitNumber,
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUpcoming(req: Request, res: Response, next: NextFunction) {
    const { limit } = req.query;
    try {
      const webinars = await this.webinarService.getUpcomingWebinars(
        limit ? parseInt(limit as string) : 6
      );
      res.status(200).json(webinars);
    } catch (error) {
      next(error);
    }
  }

  async getPast(req: Request, res: Response, next: NextFunction) {
    const { limit } = req.query;
    try {
      const webinars = await this.webinarService.getPastWebinars(
        limit ? parseInt(limit as string) : undefined
      );
      res.status(200).json({ webinars });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const webinar = await this.webinarService.getWebinarById(id);
      if (!webinar) {
        return next(createHttpError(404, "Webinar not found"));
      }
      res.status(200).json(webinar);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const webinar = await this.webinarService.deleteWebinar(id);
      if (!webinar) {
        return next(createHttpError(404, "Webinar not found"));
      }
      res.status(200).json(webinar);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      // check webinar exist or not
      const webinarExist = await this.webinarService.getWebinarById(id);
      if (!webinarExist) {
        return next(createHttpError(404, "Webinar not found"));
      }

      const image = req.files?.image as UploadedFile;
      let url = null;
      if (image) {
        const imageName = uuidv4();
        url = await this.storage.upload({
          fileName: imageName,
          fileData: image.data.buffer,
          contentType: image.mimetype,
        });
      }

      const webinar = await this.webinarService.updateWebinar(id, {
        ...req.body,
        image: url ? url : webinarExist.image,
        date: req.body.date ? startOfDay(new Date(req.body.date)) : webinarExist.date,
      });
      res.status(200).json(webinar);
    } catch (error) {
      next(error);
    }
  }
}

export default WebinarController;
