import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import CategoryService from "../services/CategoryService";
import CategoryController from "../controllers/CategoryController";
import asyncHandler from "../utils/asyncHandler";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { TranslationService } from "../services/TranslationService";

const categoryRouter = Router();
const translateService = new TranslationService();
const categoryService = new CategoryService(translateService);
const categoryController = new CategoryController(categoryService);

categoryRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await categoryController.getAll(req, res, next);
  })
);

categoryRouter.post(
  "/",
  authenticate as RequestHandler,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await categoryController.create(req, res, next);
  })
);

categoryRouter.put(
  "/:id",
  authenticate as RequestHandler,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await categoryController.update(req, res, next);
  })
);

categoryRouter.delete(
  "/:id",
  authenticate as RequestHandler,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await categoryController.delete(req, res, next);
  })
);

export default categoryRouter;
