import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import RegistrationService from "../services/RegistrationService";
import RegistrationController from "../controllers/RegistrationController";
import asyncHandler from "../utils/asyncHandler";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { AuthRequest } from "../types";

const registrationRouter = Router();
const registrationService = new RegistrationService();
const registrationController = new RegistrationController(registrationService);

// Public routes
registrationRouter.get(
  "/events/:eventId",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await registrationController.getAll(req, res, next);
  })
);

// Authenticated user routes
registrationRouter.post(
  "/",
  authenticate as RequestHandler,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await registrationController.create(req as AuthRequest, res, next);
  })
);

registrationRouter.get(
  "/check/:eventId",
  authenticate as RequestHandler,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await registrationController.checkRegistration(req as AuthRequest, res, next);
  })
);

registrationRouter.delete(
  "/:id",
  authenticate as RequestHandler,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await registrationController.cancel(req as AuthRequest, res, next);
  })
);

// Admin routes
registrationRouter.patch(
  "/:id/status",
  authenticate as RequestHandler,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await registrationController.updateStatus(req, res, next);
  })
);

// User-specific registrations
registrationRouter.get(
  "/user/:userId",
  authenticate as RequestHandler,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await registrationController.getAll(req, res, next);
  })
);

export default registrationRouter;
