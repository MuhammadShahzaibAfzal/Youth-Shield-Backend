import { NextFunction, Request, Response, Router } from "express";
import ScreeningSubmissionService from "../services/ScreeningSubmissonService";
import ScreeningSubmissionController from "../controllers/ScreeningSubmissionController";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../types";

const screeningSubmissionRouter = Router();

const screeningSubmissionService = new ScreeningSubmissionService();

const screeningSubmissionController = new ScreeningSubmissionController(
  screeningSubmissionService
);

// 📌 Create a new screening submission
screeningSubmissionRouter.post(
  "/",
  authenticate,
  canAccess(["user", "ambassador"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningSubmissionController.createSubmission(req as AuthRequest, res, next);
  })
);

// 📌 Get a specific submission by ID
screeningSubmissionRouter.get(
  "/:id",
  authenticate,
  canAccess(["user", "admin", "ambassador"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningSubmissionController.getSubmission(req, res, next);
  })
);

// 📌 Get all screening submissions
screeningSubmissionRouter.get(
  "/",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningSubmissionController.getAllSubmissions(req, res, next);
  })
);

// 📌 Update a submission
screeningSubmissionRouter.put(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningSubmissionController.updateSubmission(req, res, next);
  })
);

// 📌 Delete a submission
screeningSubmissionRouter.delete(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningSubmissionController.deleteSubmission(req, res, next);
  })
);

// 📌 Get a user's submission for a specific screening
screeningSubmissionRouter.get(
  "/user/:userId/screening/:screeningId",
  authenticate,
  canAccess(["admin", "ambassador"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningSubmissionController.getUserSubmissionForScreening(req, res, next);
  })
);

// 📌 Get screening leaderboard
screeningSubmissionRouter.get(
  "/screening/:screeningId/leaderboard",
  authenticate,
  canAccess(["admin", "ambassador", "user"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningSubmissionController.getScreeningLeaderboard(req, res, next);
  })
);

// 📌 Get screening statistics
screeningSubmissionRouter.get(
  "/screening/:screeningId/statistics",
  authenticate,
  canAccess(["admin", "ambassador"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await screeningSubmissionController.getScreeningStatistics(req, res, next);
  })
);

export default screeningSubmissionRouter;
