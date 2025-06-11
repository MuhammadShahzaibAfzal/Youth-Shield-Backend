import { NextFunction, Request, Response } from "express";
import CategoryService from "../services/CategoryService";
import createHttpError from "http-errors";
import slugify from "slugify";

class CategoryController {
  private categoryService: CategoryService;
  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await this.categoryService.getAll();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const { name } = req.body;
    if (!name) {
      return next(createHttpError(400, "Name is required"));
    }
    try {
      const slug = slugify(name, { lower: true });
      const isExist = await this.categoryService.getBySlug(slug);
      if (isExist) {
        return next(createHttpError(400, "Category already exist"));
      }
      const category = await this.categoryService.create({
        ...req.body,
        slug,
      });
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return next(createHttpError(400, "Name is required"));
    }
    try {
      const slug = slugify(name, { lower: true });
      const isExist = await this.categoryService.getBySlug(slug);
      // @ts-ignore
      if (isExist && isExist._id.toString() !== id) {
        return next(createHttpError(400, "Category already exist"));
      }
      const category = await this.categoryService.update(id, {
        ...req.body,
        slug,
      });
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const category = await this.categoryService.delete(id);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }
}

export default CategoryController;
