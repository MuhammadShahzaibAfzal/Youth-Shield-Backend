import { NextFunction, Request, Response, Router } from "express";
import NewsController from "../controllers/NewsController";
import CloudinaryStorageService from "../services/CloudinaryService";
import fileUpload from "express-fileupload";
import asyncHandler from "../utils/asyncHandler";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import NewsService from "../services/NewsService";
import CategoryService from "../services/CategoryService";

const newsRouter = Router();
const storage = new CloudinaryStorageService();
const newsService = new NewsService();
const categoryService = new CategoryService();
const newsController = new NewsController(storage, newsService, categoryService);

newsRouter.post(
  "/upload",
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsController.uploadFile(req, res, next);
  })
);

newsRouter.post(
  "/",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsController.create(req, res, next);
  })
);

newsRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsController.getAll(req, res, next);
  })
);

newsRouter.get(
  "/public",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsController.getNews(req, res, next);
  })
);

newsRouter.get(
  "/recents",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsController.getAdminDashboard(req, res, next);
  })
);

newsRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsController.getOne(req, res, next);
  })
);

newsRouter.get(
  "/slug/:slug",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsController.getBySlug(req, res, next);
  })
);

newsRouter.put(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsController.update(req, res, next);
  })
);

newsRouter.delete(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsController.delete(req, res, next);
  })
);

export default newsRouter;
