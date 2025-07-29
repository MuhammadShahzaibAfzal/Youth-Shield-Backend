import { Request, Response, NextFunction } from "express";
import { UploadedFile } from "express-fileupload";
import { FileStorage } from "../types/storage";
import createHttpError from "http-errors";
import ResourceService from "../services/ResourceService";
import { v4 as uuidv4 } from "uuid";

class ResourcesController {
  constructor(private storage: FileStorage, private resourceService: ResourceService) {}

  // --------- CATEGORY METHODS ----------

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await this.resourceService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await this.resourceService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await this.resourceService.getCategoryById(req.params.id);
      if (!category) {
        return next(createHttpError(404, "Category not found"));
      }
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await this.resourceService.updateCategory(req.params.id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await this.resourceService.deleteCategory(req.params.id);
      res.status(200).json(deleted);
    } catch (error) {
      next(error);
    }
  }

  // --------- RESOURCE METHODS ----------

  async createResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, name, shortDescription, url } = req.body;

      console.log("category id : ", categoryId, req.body);

      let pdfUrl: string | undefined;

      const pdf = req.files?.pdf as UploadedFile;
      if (pdf) {
        const pdfFileName = `${uuidv4()}.${pdf.name.split(".").pop()}`;
        pdfUrl = await this.storage.upload({
          fileName: pdfFileName,
          fileData: pdf.data.buffer,
          contentType: pdf.mimetype,
        });
      }

      const resource = await this.resourceService.createResource({
        categoryId,
        name,
        shortDescription,
        url,
        pdfUrl,
      });

      res.status(201).json(resource);
    } catch (error) {
      next(error);
    }
  }

  async updateResource(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await this.resourceService.getResourceById(req.params.id);
      if (!existing) return next(createHttpError(404, "Resource not found"));

      let pdfUrl = existing.pdfUrl;

      const pdf = req.files?.pdf as UploadedFile;
      if (pdf) {
        const pdfFileName = `${uuidv4()}.${pdf.name.split(".").pop()}`;
        pdfUrl = await this.storage.upload({
          fileName: pdfFileName,
          fileData: pdf.data.buffer,
          contentType: pdf.mimetype,
        });
      }

      const updated = await this.resourceService.updateResource(req.params.id, {
        ...req.body,
        pdfUrl,
      });

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteResource(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await this.resourceService.deleteResource(req.params.id);
      res.status(200).json(deleted);
    } catch (error) {
      next(error);
    }
  }

  async getAllResources(req: Request, res: Response, next: NextFunction) {
    try {
      const resources = await this.resourceService.getAllResources();
      res.status(200).json(resources);
    } catch (error) {
      next(error);
    }
  }

  async getResourceById(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await this.resourceService.getResourceById(req.params.id);
      if (!resource) {
        return next(createHttpError(404, "Resource not found"));
      }
      res.status(200).json(resource);
    } catch (error) {
      next(error);
    }
  }

  async getResources(req: Request, res: Response, next: NextFunction) {
    const { limit = "10", page = "1", categoryId, search } = req.query;

    try {
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const skip = (pageNumber - 1) * limitNumber;

      const { resources, total } = await this.resourceService.getResources({
        limit: limitNumber,
        skip,
        categoryId: categoryId as string,
        search: search as string,
      });

      res.status(200).json({
        resources,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        total,
        limit: limitNumber,
      });
    } catch (error) {
      next(error);
    }
  }

  async getResourcesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const resources = await this.resourceService.getResourcesByCategory(categoryId);
      res.status(200).json(resources);
    } catch (error) {
      next(error);
    }
  }
}

export default ResourcesController;
