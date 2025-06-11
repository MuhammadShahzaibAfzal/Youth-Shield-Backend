import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import AuthController from "../controllers/AuthController";
import TokenService from "../services/TokenService";
import {
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  passwordResetValidator,
  updateProfileValidator,
} from "../validators/authValidators";
import asyncHandler from "../utils/asyncHandler";

import createHttpError from "http-errors";
import fileUpload from "express-fileupload";
import CloudinaryStorageService from "../services/CloudinaryService";
import UserService from "../services/UserService";
import RefreshTokenServiceDB from "../services/RefershTokenDBService";
import { NodeMailerNotificationService } from "../services/NodeMailerService";
import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "../types";
import validateRefreshToken from "../middlewares/validateRefreshToken";

const authRouter = Router();

const userService = new UserService();
const tokenServiceDB = new RefreshTokenServiceDB();
const tokenService = new TokenService(tokenServiceDB);
const mailService = new NodeMailerNotificationService();
const storageService = new CloudinaryStorageService();
const authController = new AuthController(
  userService,
  tokenService,
  mailService,
  storageService
);

authRouter.post(
  "/login",
  loginValidator,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await authController.login(req, res, next);
  })
);

authRouter.get(
  "/self",
  authenticate as RequestHandler,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await authController.self(req as AuthRequest & Request, res, next);
  })
);

authRouter.get(
  "/refresh",
  validateRefreshToken as RequestHandler,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await authController.refresh(req as AuthRequest & Request, res, next);
  })
);

authRouter.post(
  "/logout",
  authenticate as RequestHandler,
  // parsedRefreshToken as RequestHandler,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await authController.logout(req as AuthRequest & Request, res, next);
  })
);

authRouter.post(
  "/forget-password",
  forgotPasswordValidator,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await authController.forgetPassword(req, res, next);
  })
);

authRouter.post(
  "/reset-password",
  passwordResetValidator,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await authController.resetPassword(req, res, next);
  })
);

authRouter.post(
  "/change-password",
  authenticate as RequestHandler,
  changePasswordValidator,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await authController.changePassword(req as AuthRequest, res, next);
  })
);

authRouter.put(
  "/update-profile",
  authenticate as RequestHandler,
  fileUpload({
    limits: { fieldSize: 500 * 1024 }, // 500kb
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
      const err = createHttpError(400, "File size exceeded the limit");
      next(err);
    },
  }),
  updateProfileValidator,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await authController.updateProfile(req as AuthRequest, res, next);
  })
);

authRouter.post(
  "/request-demo",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await authController.sendEmail(req, res, next);
  })
);

export default authRouter;
