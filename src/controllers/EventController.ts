import { NextFunction, Request, Response } from "express";
import { FileStorage } from "../types/storage";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import createHttpError from "http-errors";
import EventService from "../services/EventService";

class EventController {
  constructor(private storage: FileStorage, private eventService: EventService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    const { SEO, eventDate } = req.body;

    try {
      const parsedSEO = JSON.parse(SEO);
      const parsedEventDate = new Date(eventDate);

      // Upload image
      const image = req.files?.image as UploadedFile;
      if (!image) {
        return next(createHttpError(400, "No file uploaded"));
      }

      const imageName = uuidv4();
      const url = await this.storage.upload({
        fileName: imageName,
        fileData: image.data.buffer,
        contentType: image.mimetype,
      });

      const event = await this.eventService.createEvent({
        ...req.body,
        image: url,
        SEO: parsedSEO,
        eventDate: parsedEventDate,
      });
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await this.eventService.getAllEvents();
      res.status(200).json({ events });
    } catch (error) {
      next(error);
    }
  }

  async getEvents(req: Request, res: Response, next: NextFunction) {
    const { limit, page, type, status } = req.query;
    try {
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      const { events, total } = await this.eventService.getEvents({
        skip,
        limit: limitNumber,
        type: type as "virtual" | "physical",
        status: status as "publish" | "draft",
        upcomingOnly: false,
      });

      const featuredEvents = await this.eventService.getFeaturedEvents(3);

      res.status(200).json({
        events,
        featuredEvents,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        limit: limitNumber,
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingEvents(req: Request, res: Response, next: NextFunction) {
    const { limit } = req.query;
    try {
      const limitNumber = parseInt(limit as string) || 5;
      const events = await this.eventService.getUpcomingEvents(limitNumber);
      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await this.eventService.getEventById(id);
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const event = await this.eventService.deleteEvent(id);
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { SEO, eventDate } = req.body;

    try {
      const parsedSEO = JSON.parse(SEO);
      const parsedEventDate = new Date(eventDate);
      const eventExist = await this.eventService.getEventById(id);
      if (!eventExist) {
        return next(createHttpError(404, "Event not found"));
      }

      const image = req.files?.image as UploadedFile;
      let url = null;
      if (image) {
        const imageName = uuidv4();
        url = await this.storage.upload({
          fileName: imageName,
          fileData: image.data.buffer,
          contentType: image.mimetype,
        });
      }

      const event = await this.eventService.updateEvent(id, {
        ...req.body,
        SEO: parsedSEO,
        eventDate: parsedEventDate,
        image: url ? url : eventExist.image,
      });
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const { userID } = req.query;
    try {
      const result = await this.eventService.getBySlug(slug, userID as string);
      if (!result.event) {
        return next(createHttpError(404, "Event not found"));
      }
      res.status(200).json({
        event: result.event,
        registration: result.registration,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { events, totalEvents, totalCategories } =
        await this.eventService.getRecentEvents(5, true);
      res.status(200).json({
        events,
        totalEvents,
        totalCategories,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default EventController;
