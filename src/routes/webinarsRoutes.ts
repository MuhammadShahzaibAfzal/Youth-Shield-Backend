import { NextFunction, Request, Response, Router } from "express";
import WebinarService from "../services/WebinarService";
import WebinarController from "../controllers/WebinarController";
import CloudinaryStorageService from "../services/CloudinaryService";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import fileUpload from "express-fileupload";
import asyncHandler from "../utils/asyncHandler";

const webinarsRouter = Router();
const webinarService = new WebinarService();
const storageService = new CloudinaryStorageService();
const webinarController = new WebinarController(storageService, webinarService);

webinarsRouter.post(
  "/",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await webinarController.create(req, res, next);
  })
);

webinarsRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await webinarController.getAll(req, res, next);
  })
);

webinarsRouter.get(
  "/upcoming",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await webinarController.getUpcoming(req, res, next);
  })
);

webinarsRouter.get(
  "/past",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await webinarController.getPast(req, res, next);
  })
);

webinarsRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await webinarController.getOne(req, res, next);
  })
);

webinarsRouter.put(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await webinarController.update(req, res, next);
  })
);

webinarsRouter.delete(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await webinarController.delete(req, res, next);
  })
);

export default webinarsRouter;
