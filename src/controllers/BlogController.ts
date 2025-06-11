import { NextFunction, Request, Response } from "express";
import { FileStorage } from "../types/storage";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import createHttpError from "http-errors";
import BlogService from "../services/BlogService";
import CategoryService from "../services/CategoryService";

class BlogController {
  constructor(
    private storage: FileStorage,
    private blogService: BlogService,
    private categoryService: CategoryService
  ) {}

  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const image = req.files?.["files[0]"] as UploadedFile;
      if (!image) {
        return next(createHttpError(400, "No file uploaded"));
      }

      const imageName = uuidv4();
      const url = await this.storage.upload({
        fileName: imageName,
        fileData: image.data.buffer,
        contentType: image.mimetype,
      });

      res.json({
        url,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const { SEO } = req.body;

    try {
      const parsedSEO = JSON.parse(SEO);
      const image = req.files?.coverImage as UploadedFile;
      if (!image) {
        return next(createHttpError(400, "No file uploaded"));
      }

      const imageName = uuidv4();
      const url = await this.storage.upload({
        fileName: imageName,
        fileData: image.data.buffer,
        contentType: image.mimetype,
      });

      const blog = await this.blogService.createBlog({
        ...req.body,
        coverImage: url,
        SEO: parsedSEO,
      });
      res.status(201).json(blog);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const blogs = await this.blogService.getAll();
      res.status(200).json({ blogs });
    } catch (error) {
      next(error);
    }
  }

  async getBlogs(req: Request, res: Response, next: NextFunction) {
    const { limit, page, category } = req.query;
    try {
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      const { blogs, total } = await this.blogService.getBlogs({
        skip,
        limit: limitNumber,
        categorySlug: category as string,
      });
      const categories = await this.categoryService.getAll();
      const { blogs: recent } = await this.blogService.getRecent(1, false);
      res.status(200).json({
        blogs,
        categories,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        limit: limitNumber,
        total,
        recent,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog = await this.blogService.getBlogById(id);
      res.status(200).json(blog);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const blog = await this.blogService.deleteBlog(id);
      res.status(200).json(blog);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { SEO } = req.body;

    try {
      const parsedSEO = JSON.parse(SEO);
      // check blog exist or not
      const blogExist = await this.blogService.getBlogById(id);
      if (!blogExist) {
        return next(createHttpError(404, "Blog not found"));
      }
      const image = req.files?.coverImage as UploadedFile;
      let url = null;
      if (image) {
        const imageName = uuidv4();
        url = await this.storage.upload({
          fileName: imageName,
          fileData: image.data.buffer,
          contentType: image.mimetype,
        });
      }

      const blog = await this.blogService.updateBlog(id, {
        ...req.body,
        SEO: parsedSEO,
        coverImage: url ? url : blogExist.coverImage,
      });
      res.status(200).json(blog);
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    try {
      const blog = await this.blogService.getBySlug(slug);
      if (!blog) {
        return next(createHttpError(404, "Blog not found"));
      }
      res.status(200).json(blog);
    } catch (error) {
      next(error);
    }
  }

  async getAdminDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { blogs, totalBlogs, totalCategories } = await this.blogService.getRecent(
        5,
        true
      );
      res.status(200).json({
        blogs,
        totalBlogs,
        totalCategories,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default BlogController;
