import { NextFunction, Response, Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import AnonymousScreeningSubmissionController from "../controllers/AnonymousScreeningSubmissionController";
import AnonymousScreeningSubmissionService from "../services/AnonymousScreeningSubmissionService";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";

const anonymousScreeningSubmissionRouter = Router();
const anonymousScreeningSubmissionService = new AnonymousScreeningSubmissionService();
const anonymousScreeningSubmissionController = new AnonymousScreeningSubmissionController(
  anonymousScreeningSubmissionService
);

anonymousScreeningSubmissionRouter.post(
  "/",
  asyncHandler(async (req, res, next) => {
    await anonymousScreeningSubmissionController.create(req, res, next);
  })
);

anonymousScreeningSubmissionRouter.get(
  "/",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req, res, next) => {
    await anonymousScreeningSubmissionController.getAllSubmissions(req, res, next);
  })
);

anonymousScreeningSubmissionRouter.delete(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req, res, next) => {
    await anonymousScreeningSubmissionController.delete(req, res, next);
  })
);

anonymousScreeningSubmissionRouter.get(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req, res, next) => {
    await anonymousScreeningSubmissionController.getOne(req, res, next);
  })
);

export default anonymousScreeningSubmissionRouter;
