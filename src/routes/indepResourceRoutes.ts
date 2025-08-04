import { Router, Request, Response, NextFunction } from "express";
import fileUpload from "express-fileupload";
import asyncHandler from "../utils/asyncHandler";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import IndependentResourceService from "../services/IndepResourceService";
import CloudinaryStorageService from "../services/CloudinaryService";
import IndependentResourcesController from "../controllers/IndepResourceController";
import { TranslationService } from "../services/TranslationService";

const independentResourceRouter = Router();
const storage = new CloudinaryStorageService();
const translationService = new TranslationService();
const resourceService = new IndependentResourceService(translationService);
const resourceController = new IndependentResourcesController(storage, resourceService);

//
// ---------------- CATEGORY ROUTES (Admin Only) ----------------
//

independentResourceRouter.post(
  "/categories",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.createCategory(req, res, next);
  })
);

independentResourceRouter.get(
  "/categories",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getAllCategories(req, res, next);
  })
);

independentResourceRouter.get(
  "/categories/:id",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getCategoryById(req, res, next);
  })
);

independentResourceRouter.put(
  "/categories/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.updateCategory(req, res, next);
  })
);

independentResourceRouter.delete(
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
independentResourceRouter.post(
  "/",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.createResource(req, res, next);
  })
);

// Update resource (Admin Only)
independentResourceRouter.put(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  fileUpload(),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.updateResource(req, res, next);
  })
);

// Delete resource (Admin Only)
independentResourceRouter.delete(
  "/:id",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.deleteResource(req, res, next);
  })
);

// Get all resources (Admin Only)
independentResourceRouter.get(
  "/admin",
  authenticate,
  canAccess(["admin"]),
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getAllResources(req, res, next);
  })
);

// Public paginated + filtered list
independentResourceRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getResources(req, res, next);
  })
);

// Get by ID (Public)
independentResourceRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getResourceById(req, res, next);
  })
);

// Get resources by category ID (Public)
independentResourceRouter.get(
  "/category/:categoryId",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await resourceController.getResourcesByCategory(req, res, next);
  })
);

export default independentResourceRouter;
