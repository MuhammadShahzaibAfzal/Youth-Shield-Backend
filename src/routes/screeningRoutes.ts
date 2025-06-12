import { NextFunction, Request, Response, Router } from "express";
import CloudinaryStorageService from "../services/CloudinaryService";

import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import fileUpload from "express-fileupload";
import asyncHandler from "../utils/asyncHandler";
import ScreeningService from "../services/ScreeningService";
import ScreeningController from "../controllers/ScreeningController";

const screeningRouter = Router();
const storage = new CloudinaryStorageService();
const screeningService = new ScreeningService();

const screeningController = new ScreeningController(storage, screeningService);

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
  authenticate,
  canAccess(["admin", "user"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.getAll(req, res, next);
  })
);

screeningRouter.get(
  "/recents",
  authenticate,
  canAccess(["admin", "user"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.getRecentScreenings(req, res, next);
  })
);

screeningRouter.get(
  "/:id",
  authenticate,
  canAccess(["admin", "user"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.getOne(req, res, next);
  })
);

screeningRouter.get(
  "/slug/:slug",
  authenticate,
  canAccess(["admin", "user"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.getBySlug(req, res, next);
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

screeningRouter.post(
  "/:id/questions",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.addQuestion(req, res, next);
  })
);

screeningRouter.put(
  "/:id/questions/:questionId",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.updateQuestion(req, res, next);
  })
);

screeningRouter.delete(
  "/:id/questions/:questionId",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.removeQuestion(req, res, next);
  })
);

screeningRouter.put(
  "/:id/status",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.changeStatus(req, res, next);
  })
);

screeningRouter.put(
  "/:id/validate",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningController.validateScreening(req, res, next);
  })
);

export default screeningRouter;
