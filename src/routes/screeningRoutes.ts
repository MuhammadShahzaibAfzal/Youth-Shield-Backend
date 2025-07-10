import { NextFunction, Request, Response, Router } from "express";
import CloudinaryStorageService from "../services/CloudinaryService";

import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import fileUpload from "express-fileupload";
import asyncHandler from "../utils/asyncHandler";
import ScreeningService from "../services/ScreeningService";
import ScreeningController from "../controllers/ScreeningController";
import ScreeningSubmissionService from "../services/ScreeningSubmissonService";
import { AuthRequest } from "../types";

const screeningRouter = Router();
const storage = new CloudinaryStorageService();
const screeningService = new ScreeningService();
const screeningSubmissionService = new ScreeningSubmissionService();

const screeningController = new ScreeningController(
  storage,
  screeningService,
  screeningSubmissionService
);

screeningRouter.post(
  "/",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.create(req, res, next);
  })
);

screeningRouter.get(
  "/",

  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.getAll(req, res, next);
  })
);

screeningRouter.get(
  "/recents",

  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.getRecentScreenings(req, res, next);
  })
);

screeningRouter.get(
  "/:id",

  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.getOne(req, res, next);
  })
);

screeningRouter.get(
  "/slug/:slug",
  authenticate,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.getBySlug(req as AuthRequest, res, next);
  })
);

screeningRouter.put(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.update(req, res, next);
  })
);

screeningRouter.delete(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.delete(req, res, next);
  })
);

export default screeningRouter;
