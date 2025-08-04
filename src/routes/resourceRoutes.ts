import { Router, Request, Response, NextFunction } from "express";
import fileUpload from "express-fileupload";
import asyncHandler from "../utils/asyncHandler";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import ResourceService from "../services/ResourceService";
import CloudinaryStorageService from "../services/CloudinaryService";
import ResourcesController from "../controllers/ResourceController";
import { TranslationService } from "../services/TranslationService";

const resourceRouter = Router();
const storage = new CloudinaryStorageService();
const translationService = new TranslationService();
const resourceService = new ResourceService(translationService);
const resourceController = new ResourcesController(storage, resourceService);

//
// ---------------- CATEGORY ROUTES (Admin Only) ----------------
//

resourceRouter.post(
  "/categories",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.createCategory(req, res, next);
  })
);

resourceRouter.get(
  "/categories",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getAllCategories(req, res, next);
  })
);

resourceRouter.get(
  "/categories/:id",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getCategoryById(req, res, next);
  })
);

resourceRouter.put(
  "/categories/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.updateCategory(req, res, next);
  })
);

resourceRouter.delete(
  "/categories/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.deleteCategory(req, res, next);
  })
);

//
// ---------------- RESOURCE ROUTES ----------------
//

// Create new resource (Admin Only)
resourceRouter.post(
  "/",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.createResource(req, res, next);
  })
);

// Update resource (Admin Only)
resourceRouter.put(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.updateResource(req, res, next);
  })
);

// Delete resource (Admin Only)
resourceRouter.delete(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.deleteResource(req, res, next);
  })
);

// Get all resources (Admin Only)
resourceRouter.get(
  "/admin",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getAllResources(req, res, next);
  })
);

// Public paginated + filtered list
resourceRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getResources(req, res, next);
  })
);

// Get by ID (Public)
resourceRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getResourceById(req, res, next);
  })
);

// Get resources by category ID (Public)
resourceRouter.get(
  "/category/:categoryId",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getResourcesByCategory(req, res, next);
  })
);

export default resourceRouter;
