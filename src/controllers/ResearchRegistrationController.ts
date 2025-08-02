import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import ResearchRegistrationService from "../services/ResearchRegistrationService";

class ResearchRegistrationController {
  private researchService: ResearchRegistrationService;

  constructor(researchService: ResearchRegistrationService) {
    this.researchService = researchService;
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await this.researchService.getAll();
      res.status(200).json(records);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const record = await this.researchService.getById(id);
      if (!record) {
        return next(createHttpError(404, "Record not found"));
      }
      res.status(200).json(record);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    // const { name, country, grade, reason, highSchool } = req.body;

    // if (!name || !country || !grade || !reason || !highSchool) {
    //   return next(createHttpError(400, "All fields are required"));
    // }

    try {
      const newRecord = await this.researchService.create(req.body);
      res.status(201).json(newRecord);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { name, country, grade, reason, highSchool } = req.body;

    if (!name || !country || !grade || !reason || !highSchool) {
      return next(createHttpError(400, "All fields are required"));
    }

    try {
      const updated = await this.researchService.update(id, req.body);
      if (!updated) {
        return next(createHttpError(404, "Record not found"));
      }
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const deleted = await this.researchService.delete(id);
      if (!deleted) {
        return next(createHttpError(404, "Record not found"));
      }
      res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default ResearchRegistrationController;
