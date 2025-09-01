import { NextFunction, Request, Response } from "express";
import NewsLetterService from "../services/NewsLetterService";
import createHttpError from "http-errors";

class NewsLetterController {
  private newsLetterService: NewsLetterService;

  constructor(newsLetterService: NewsLetterService) {
    this.newsLetterService = newsLetterService;
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const subscribers = await this.newsLetterService.getAll();
      res.status(200).json(subscribers);
    } catch (error) {
      next(error);
    }
  }

  async subscribe(req: Request, res: Response, next: NextFunction) {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      return next(createHttpError(400, "First name, last name and email are required"));
    }

    try {
      const existingSubscriber = await this.newsLetterService.findByEmail(email);
      if (existingSubscriber && existingSubscriber.status === "subscribed") {
        return next(createHttpError(400, "You are already subscribed this newsletter."));
      }
      const subscriber = await this.newsLetterService.subscribe({
        firstName,
        lastName,
        email,
      });
      res.status(201).json(subscriber);
    } catch (error) {
      next(error);
    }
  }

  async unsubscribe(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;

    if (!email) {
      return next(createHttpError(400, "Email is required"));
    }

    try {
      const subscriber = await this.newsLetterService.unsubscribe(email);
      res.status(200).json(subscriber);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const deleted = await this.newsLetterService.delete(id);
      res.status(200).json(deleted);
    } catch (error) {
      next(error);
    }
  }
}

export default NewsLetterController;
