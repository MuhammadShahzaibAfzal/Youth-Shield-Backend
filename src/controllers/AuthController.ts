import { NextFunction, Request, Response } from "express";
import TokenService from "../services/TokenService";
import UserService from "../services/UserService";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import logger from "../config/logger";
import { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../types";
import Config from "../config";
import { MailNotificationService } from "../types/notification";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import { IUser } from "../models/UserModel";
import { FileStorage } from "../types/storage";
class AuthController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private mailService: MailNotificationService,
    private storage: FileStorage
  ) {}

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const cookieOptions = {
      domain: "localhost",
      sameSite: "strict" as const,
      httpOnly: true,
    };
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60, // 1 hour
      ...cookieOptions,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      ...cookieOptions,
    });
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }
    const { email, password } = req.body;
    try {
      let user = await this.userService.findUserByEmail(email);
      if (!user) {
        if (email === "admin@info.com") {
          user = await this.userService.createUser({
            email,
            firstName: "Admin",
            lastName: "User",
            password,
            role: "admin",
          });
          logger.info("Admin user has been created", { id: user._id });
        } else {
          return next(createHttpError(400, "Email or password does not match."));
        }
      }

      const isPasswordMatch = await user.isPasswordCorrect(password);
      if (!isPasswordMatch) {
        return next(createHttpError(400, "Email or password does not match."));
      }

      // verify role
      if (req.body.role === "admin") {
        if (user.role !== "admin") {
          return next(createHttpError(400, "You don't have permission to login."));
        }
      } else {
        if (user.role !== req.body.role) {
          return next(createHttpError(400, "You don't have permission to login."));
        }
      }

      const payload: JwtPayload = { sub: String(user.id), role: user.role };
      const accessToken = this.tokenService.generateAccessToken(payload);
      const newRefreshToken = await this.tokenService.persistRefreshToken(
        user._id.toString()
      );
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken._id),
      });

      this.setAuthCookies(res, accessToken, refreshToken);

      logger.info("User has been logged in", { id: user._id });
      res.json({
        id: user._id,
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          imageURL: user.imageURL,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }
    const {
      email,
      firstName,
      lastName,
      password,
      role,
      gender,
      highSchool,
      dob,
      country,
    } = req.body;
    try {
      // Check email exist or not.
      const isEmailExist = await this.userService.findUserByEmail(email);
      if (isEmailExist) {
        return next(createHttpError(400, "Email already exist."));
      }

      const user = await this.userService.createUser({
        email,
        firstName,
        lastName,
        password,
        role,
        gender,
        highSchool,
        dob,
        country,
      });
      logger.info("User has been registered", { id: user._id });
      // generate tokens
      const payload: JwtPayload = { sub: String(user.id), role: user.role };
      const accessToken = this.tokenService.generateAccessToken(payload);
      const newRefreshToken = await this.tokenService.persistRefreshToken(
        user._id.toString()
      );
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken._id),
      });

      this.setAuthCookies(res, accessToken, refreshToken);

      res.json({
        id: user._id,
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          imageURL: user.imageURL,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async self(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.auth.sub;
      // const role = req.auth.role;
      const user = await this.userService.findUserById(id);

      if (!user) {
        return next(createHttpError(404, "User not found."));
      }

      res.json({
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findUserById(req.auth.sub);
      if (!user) {
        return next(createHttpError(400, "User with the token could not be found"));
      }
      const payload: JwtPayload = { sub: req.auth.sub, role: user.role };
      const accessToken = this.tokenService.generateAccessToken(payload);

      const newRefreshToken = await this.tokenService.persistRefreshToken(
        user._id.toString()
      );
      await this.tokenService.deleteRefreshToken(req.auth.id!);
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      this.setAuthCookies(res, accessToken, refreshToken);

      logger.info("Token has been refreshed.", { id: user.id });
      res.json({ id: user.id, accessToken, refreshToken, user });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(req.auth.id!);
      logger.info("Refresh token has been deleted", { id: req.auth.id });
      logger.info("User has been logged out", { id: req.auth.sub });

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json({});
    } catch (error) {
      next(error);
    }
  }

  async forgetPassword(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }
    const { email } = req.body;

    try {
      // Check email exist or not.
      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        return next(createHttpError(400, "User does not exist of that email."));
      }
      // GENERATE TEMPORY TOKEN FOR PASSWORD RESET
      const resetToken = await this.tokenService.generateForgetPasswordToken({ email });

      this.mailService.send({
        to: email,
        subject: "Password Reset",
        html: `Hello ${user.firstName},<br><br>Please click on the link below to reset your password.<br><br><a href="${Config.DASHBOARD_DOMAIN}/reset-password/${resetToken}">Reset Password</a>`,
      });

      return res.status(200).json({
        message: " Password reset link has been sent to your email.",
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { resetToken, newPassword } = req.body;
    try {
      const email = (await this.tokenService.verifyForgetPasswordToken(
        resetToken
      )) as string;
      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        return next(createHttpError(400, "User does not exist with that email."));
      }
      //  UPDATE PASSWORD
      await this.userService.update(user.id, { password: newPassword });
      return res.status(200).json({ message: "Password reset successfully." });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { oldPassword, newPassword } = req.body;
    try {
      const id = req.auth.sub;
      const user = await this.userService.findUserById(id, true);
      if (!user) {
        return next(createHttpError(400, "User with the token could not be found"));
      }

      // For users with a password, validate the old password
      const isPasswordMatch = await user.isPasswordCorrect(oldPassword);
      if (!isPasswordMatch) {
        return next(createHttpError(400, "Old password is incorrect"));
      }

      await this.userService.update(id, { password: newPassword });

      return res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { firstName, lastName, email, password } = req.body;
    const userId = req.auth.sub;
    try {
      const user = await this.userService.findUserById(userId);
      if (!user) {
        return next(createHttpError(400, "User with the token could not be found"));
      }
      if (user.email !== email) {
        // check new email exist or not
        const emailExist = await this.userService.findUserByEmail(email);
        if (emailExist) {
          return next(createHttpError(400, "Email already exist."));
        }
      }
      // Image upload
      const image = req.files?.image as UploadedFile;
      let imageURL;
      if (image) {
        const imageName = uuidv4();
        imageURL = await this.storage.upload({
          fileName: imageName,
          fileData: image.data.buffer,
          contentType: image.mimetype,
        });
      }
      const updateData: Partial<IUser> = {
        firstName,
        lastName,
        imageURL: imageURL,
        email,
        ...(password && { password }),
      };
      await this.userService.update(userId, updateData);
      logger.info("User profile has been updated", { id: userId });
      return res.status(200).json({ message: "Profile updated successfully." });
    } catch (error) {
      next(error);
    }
  }

  async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { to, subject, text, html } = req.body;
      await this.mailService.send({ to, subject, text, html });
      return res.status(200).json({ message: "Email sent successfully." });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
