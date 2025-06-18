import { NextFunction, Request, Response, Router } from "express";
import CloudinaryStorageService from "../services/CloudinaryService";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import fileUpload from "express-fileupload";
import asyncHandler from "../utils/asyncHandler";
import ContestService from "../services/ContestService";
import ContestController from "../controllers/ContestController";

const contestRouter = Router();
const storage = new CloudinaryStorageService();
const contestService = new ContestService();
const contestController = new ContestController(storage, contestService);

// Create a new contest
contestRouter.post(
  "/",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestController.create(req, res, next);
  })
);

// Get all contests with pagination
contestRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestController.getAll(req, res, next);
  })
);

contestRouter.get(
  "/active",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestController.getActiveContests(req, res, next);
  })
);

contestRouter.get(
  "/recents",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestController.getRecentContests(req, res, next);
  })
);

contestRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestController.getOne(req, res, next);
  })
);

contestRouter.get(
  "/slug/:slug",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestController.getBySlug(req, res, next);
  })
);

contestRouter.put(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestController.update(req, res, next);
  })
);

contestRouter.delete(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestController.delete(req, res, next);
  })
);

export default contestRouter;
