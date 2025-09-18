import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import NewsLetterService from "../services/NewsLetterService";
import NewsLetterController from "../controllers/NewsLetterController";
import asyncHandler from "../utils/asyncHandler";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { NodeMailerNotificationService } from "../services/NodeMailerService";

const newsLetterRouter = Router();
const mailService = new NodeMailerNotificationService();
const newsLetterService = new NewsLetterService(mailService);
const newsLetterController = new NewsLetterController(newsLetterService);

// 📌 Public route - subscribe
newsLetterRouter.post(
  "/subscribe",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsLetterController.subscribe(req, res, next);
  })
);

// 📌 Public route - unsubscribe
newsLetterRouter.post(
  "/unsubscribe",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsLetterController.unsubscribe(req, res, next);
  })
);

// 📌 Admin only - get all subscribers
newsLetterRouter.get(
  "/",
  authenticate as RequestHandler,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsLetterController.getAll(req, res, next);
  })
);

// 📌 Admin only - delete subscriber
newsLetterRouter.delete(
  "/:id",
  authenticate as RequestHandler,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await newsLetterController.delete(req, res, next);
  })
);

export default newsLetterRouter;
