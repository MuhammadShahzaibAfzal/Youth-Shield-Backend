import { NextFunction, Request, Response } from "express";
import { FileStorage } from "../types/storage";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import createHttpError from "http-errors";
import NewsService from "../services/NewsService";
import CategoryService from "../services/CategoryService";

class NewsController {
  constructor(
    private storage: FileStorage,
    private newsService: NewsService,
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

      res.json({ url });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const { SEO } = req.body;

    try {
      const parsedSEO = JSON.parse(SEO);
      // Upload cover image
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
      // upload card image
      const cardImage = req.files?.cardImage as UploadedFile;
      let cardUrl = null;
      if (cardImage) {
        const imageName = uuidv4();
        cardUrl = await this.storage.upload({
          fileName: imageName,
          fileData: cardImage.data.buffer,
          contentType: cardImage.mimetype,
        });
      }

      const news = await this.newsService.createNews({
        ...req.body,
        coverImage: url,
        SEO: parsedSEO,
        cardImage: cardUrl,
      });
      res.status(201).json(news);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const news = await this.newsService.getAll();
      res.status(200).json({ news });
    } catch (error) {
      next(error);
    }
  }

  async getNews(req: Request, res: Response, next: NextFunction) {
    const { limit, page, category } = req.query;
    try {
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      const { news, total } = await this.newsService.getNews({
        skip,
        limit: limitNumber,
        categorySlug: category as string,
      });
      const categories = await this.categoryService.getAll();
      const { news: recent } = await this.newsService.getRecent(1, false);

      res.status(200).json({
        news,
        categories,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        limit: limitNumber,
        total,
        recent: recent?.[0],
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const news = await this.newsService.getNewsById(id);
      res.status(200).json(news);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const news = await this.newsService.deleteNews(id);
      res.status(200).json(news);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { SEO } = req.body;

    try {
      const parsedSEO = JSON.parse(SEO);
      const newsExist = await this.newsService.getNewsById(id);
      if (!newsExist) {
        return next(createHttpError(404, "News not found"));
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

      const cardImage = req.files?.cardImage as UploadedFile;
      let cardUrl = null;
      if (cardImage) {
        const imageName = uuidv4();
        cardUrl = await this.storage.upload({
          fileName: imageName,
          fileData: cardImage.data.buffer,
          contentType: cardImage.mimetype,
        });
      }

      const news = await this.newsService.updateNews(id, {
        ...req.body,
        SEO: parsedSEO,
        coverImage: url ? url : newsExist.coverImage,
        cardImage: cardUrl ? cardUrl : newsExist.cardImage,
      });
      res.status(200).json(news);
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    try {
      const news = await this.newsService.getBySlug(slug);
      if (!news) {
        return next(createHttpError(404, "News not found"));
      }
      res.status(200).json(news);
    } catch (error) {
      next(error);
    }
  }

  async getAdminDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { news, totalNews, totalCategories } = await this.newsService.getRecent(
        5,
        true
      );
      res.status(200).json({
        news,
        totalNews,
        totalCategories,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default NewsController;
