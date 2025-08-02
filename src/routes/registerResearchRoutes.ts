import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import ResearchRegistrationService from "../services/ResearchRegistrationService";
import ResearchRegistrationController from "../controllers/ResearchRegistrationController";
import asyncHandler from "../utils/asyncHandler";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";

const researchRegistrationRouter = Router();
const researchRegistrationService = new ResearchRegistrationService();
const researchRegistrationController = new ResearchRegistrationController(
  researchRegistrationService
);

researchRegistrationRouter.get(
  "/",
  authenticate as RequestHandler,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await researchRegistrationController.getAll(req, res, next);
  })
);

researchRegistrationRouter.post(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await researchRegistrationController.create(req, res, next);
  })
);

export default researchRegistrationRouter;
