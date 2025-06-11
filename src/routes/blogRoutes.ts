import { NextFunction, Request, Response, Router } from "express";
import BlogController from "../controllers/BlogController";
import CloudinaryStorageService from "../services/CloudinaryService";
import fileUpload from "express-fileupload";
import asyncHandler from "../utils/asyncHandler";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import BlogService from "../services/BlogService";
import CategoryService from "../services/CategoryService";

const blogRouter = Router();
const storage = new CloudinaryStorageService();
const blogService = new BlogService();
const categoryService = new CategoryService();
const blogController = new BlogController(storage, blogService, categoryService);

blogRouter.post(
  "/upload",
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await blogController.uploadFile(req, res, next);
  })
);

blogRouter.post(
  "/",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await blogController.create(req, res, next);
  })
);

blogRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await blogController.getAll(req, res, next);
  })
);

blogRouter.get(
  "/public",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await blogController.getBlogs(req, res, next);
  })
);

blogRouter.get(
  "/recents",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await blogController.getAdminDashboard(req, res, next);
  })
);

blogRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await blogController.getOne(req, res, next);
  })
);

blogRouter.get(
  "/slug/:slug",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await blogController.getBySlug(req, res, next);
  })
);

blogRouter.put(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await blogController.update(req, res, next);
  })
);

blogRouter.delete(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await blogController.delete(req, res, next);
  })
);

export default blogRouter;
