import { NextFunction, Request, Response, Router } from "express";
import ContestSubmissionService from "../services/ContestSubmissionService";
import ContestSubmissionController from "../controllers/ContestSubmissionController";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../types";

const contestSubmissionRouter = Router();

const contestSubmissionServie = new ContestSubmissionService();

const contestSubmissionController = new ContestSubmissionController(
  contestSubmissionServie
);

// Create a new contest
contestSubmissionRouter.post(
  "/",
  authenticate,
  canAccess(["user", "ambassador"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestSubmissionController.createSubmission(req as AuthRequest, res, next);
  })
);

// Get a specific submission by ID
contestSubmissionRouter.get(
  "/:id",
  authenticate,
  canAccess(["user", "admin", "ambassador"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestSubmissionController.getSubmission(req, res, next);
  })
);

// Get all submissions
contestSubmissionRouter.get(
  "/",
  authenticate,
  canAccess(["user", "admin", "ambassador"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestSubmissionController.getAllSubmissions(req, res, next);
  })
);

// Update a specific submission by ID
contestSubmissionRouter.put(
  "/:id",
  authenticate,
  canAccess(["user", "admin", "ambassador"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestSubmissionController.updateSubmission(req, res, next);
  })
);

// Delete a specific submission by ID
contestSubmissionRouter.delete(
  "/:id",
  authenticate,
  canAccess(["user", "admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await contestSubmissionController.deleteSubmission(req, res, next);
  })
);

export default contestSubmissionRouter;
