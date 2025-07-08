import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { AuthRequest } from "../types";
import RegistrationService from "../services/RegistrationService";

class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.sub || req.auth?.id;
      if (!userId) {
        return next(createHttpError(401, "Unauthorized"));
      }

      const { eventId } = req.body;
      const registration = await this.registrationService.createRegistration(
        eventId,
        userId
      );

      res.status(201).json({
        success: true,
        data: registration,
        message: "Registration successful",
        registrationNumber: registration.registrationNumber,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId, userId, limit = 10, page = 1 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let registrations;
      let total;

      if (eventId) {
        const result = await this.registrationService.getRegistrationsByEvent(
          eventId as string,
          skip,
          Number(limit)
        );
        registrations = result.registrations;
        total = result.total;
      } else if (userId) {
        const result = await this.registrationService.getRegistrationsByUser(
          userId as string,
          skip,
          Number(limit)
        );
        registrations = result.registrations;
        total = result.total;
      } else {
        throw createHttpError(400, "Either eventId or userId must be provided");
      }

      res.status(200).json({
        success: true,
        registrations,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const registration = await this.registrationService.getRegistrationById(id);
      if (!registration) {
        throw createHttpError(404, "Registration not found");
      }
      res.status(200).json({ success: true, data: registration });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedRegistration = await this.registrationService.updateRegistrationStatus(
        id,
        status
      );

      if (!updatedRegistration) {
        throw createHttpError(404, "Registration not found");
      }

      res.status(200).json({
        success: true,
        data: updatedRegistration,
        message: "Registration status updated",
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.sub || req.auth?.id;
      const { id } = req.params;

      const registration = await this.registrationService.getRegistrationById(id);
      if (!registration) {
        throw createHttpError(404, "Registration not found");
      }

      // Verify user owns this registration
      if (registration.user.toString() !== userId) {
        throw createHttpError(403, "Not authorized to cancel this registration");
      }

      const cancelledRegistration = await this.registrationService.cancelRegistration(id);
      res.status(200).json({
        success: true,
        data: cancelledRegistration,
        message: "Registration cancelled",
      });
    } catch (error) {
      next(error);
    }
  }

  async checkRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.auth?.sub || req.auth?.id;
      const { eventId } = req.params;

      if (!userId) {
        throw createHttpError(401, "Unauthorized");
      }

      const isRegistered = await this.registrationService.isUserRegistered(
        eventId,
        userId
      );

      res.status(200).json({
        success: true,
        isRegistered,
        message: isRegistered
          ? "User is registered for this event"
          : "User is not registered",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RegistrationController;
