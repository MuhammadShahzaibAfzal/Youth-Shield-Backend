import { NextFunction, Request, Response, Router } from "express";
import EventController from "../controllers/EventController";
import CloudinaryStorageService from "../services/CloudinaryService";
import fileUpload from "express-fileupload";
import asyncHandler from "../utils/asyncHandler";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import EventService from "../services/EventService";

const eventRouter = Router();
const storage = new CloudinaryStorageService();
const eventService = new EventService();
const eventController = new EventController(storage, eventService);

// Create new event (admin only)
eventRouter.post(
  "/",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await eventController.create(req, res, next);
  })
);

// Get all events (admin view)
eventRouter.get(
  "/",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await eventController.getAll(req, res, next);
  })
);

// Get public events with pagination and filtering
eventRouter.get(
  "/public",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await eventController.getEvents(req, res, next);
  })
);

// Get upcoming events (public)
eventRouter.get(
  "/upcoming",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await eventController.getUpcomingEvents(req, res, next);
  })
);

// Get admin dashboard stats
eventRouter.get(
  "/recents",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await eventController.getAdminDashboard(req, res, next);
  })
);

// Get single event by ID
eventRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await eventController.getOne(req, res, next);
  })
);

// Get event by slug (public)
eventRouter.get(
  "/slug/:slug",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await eventController.getBySlug(req, res, next);
  })
);

// Update event (admin only)
eventRouter.put(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await eventController.update(req, res, next);
  })
);

// Delete event (admin only)
eventRouter.delete(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await eventController.delete(req, res, next);
  })
);

export default eventRouter;
