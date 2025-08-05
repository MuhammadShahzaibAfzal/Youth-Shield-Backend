import Config from "../config";
import Event, { IEvent, IEventTranslation } from "../models/EventModel";
import Registration from "../models/RegistrationModel";
import { TranslationService } from "./TranslationService";

class EventService {
  constructor(private translationService: TranslationService) {}
  async createEvent(data: Partial<IEvent>) {
    const schema = [
      ["title"],
      ["content"],
      ["summary"],
      ["SEO", "metaTitle"],
      ["SEO", "metaDescription"],
    ];
    const input = {
      title: data.title,
      content: data.content,
      summary: data.summary,
      SEO: {
        metaTitle: data?.SEO?.metaTitle || data.title,
        metaDescription: data?.SEO?.metaDescription || data.summary,
      },
    };
    const translations = new Map<string, IEventTranslation>();
    const translationResults = await Promise.all(
      Config.SUPPORTED_LANGUAGES.map(async (lang) => {
        const result = await this.translationService.translateJsonStructure(
          input,
          schema,
          lang
        );
        return { lang, result };
      })
    );

    translationResults.forEach(({ lang, result }) => {
      translations.set(lang, result);
    });
    return await Event.create({
      ...data,
      translations,
    });
  }

  async updateEvent(id: string, data: Partial<IEvent>) {
    const schema = [
      ["title"],
      ["content"],
      ["summary"],
      ["SEO", "metaTitle"],
      ["SEO", "metaDescription"],
    ];
    const input = {
      title: data.title,
      content: data.content,
      summary: data.summary,
      SEO: {
        metaTitle: data?.SEO?.metaTitle || data.title,
        metaDescription: data?.SEO?.metaDescription || data.summary,
      },
    };
    const translations = new Map<string, IEventTranslation>();
    const translationResults = await Promise.all(
      Config.SUPPORTED_LANGUAGES.map(async (lang) => {
        const result = await this.translationService.translateJsonStructure(
          input,
          schema,
          lang
        );
        return { lang, result };
      })
    );

    translationResults.forEach(({ lang, result }) => {
      translations.set(lang, result);
    });
    return await Event.findByIdAndUpdate(
      id,
      {
        ...data,
        translations,
      },
      { new: true }
    );
  }

  async deleteEvent(id: string) {
    return await Event.findByIdAndDelete(id);
  }

  async getEventById(id: string) {
    return await Event.findById(id);
  }

  async getAllEvents() {
    return await Event.find({}).sort({ eventDate: -1 });
  }

  async getEvents({
    limit,
    skip,
    status,
    type,
    upcomingOnly = true,
  }: {
    limit: number;
    skip: number;
    status?: "publish" | "draft";
    type?: "virtual" | "physical";
    upcomingOnly?: boolean;
  }) {
    let filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (upcomingOnly) {
      filter.eventDate = { $gte: new Date() };
    }

    const events = await Event.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ eventDate: 1 }); // Sort by event date ascending

    const total = await Event.countDocuments(filter);

    return { events, total };
  }

  async getBySlug(slug: string, userID: string | null) {
    const event = await Event.findOne({ "SEO.slug": slug });
    let registration = null;

    if (event && userID) {
      registration = await Registration.findOne({ event: event._id, user: userID })
        .populate("event")
        .populate("user", "firstName lastName imageURL email _id");
    }

    return { event, registration };
  }

  async getFeaturedEvents(limit: number) {
    return await Event.find({ isFeatured: true, status: "publish" })
      .sort({ eventDate: 1 })
      .limit(limit);
  }

  async getUpcomingEvents(limit: number) {
    return await Event.find({
      eventDate: { $gte: new Date() },
      status: "publish",
    })
      .sort({ eventDate: 1 })
      .limit(limit);
  }

  async getRecentEvents(limit: number, isAdmin: boolean = false) {
    const events = await Event.find(isAdmin ? {} : { status: "publish" })
      .sort({ createdAt: -1 })
      .limit(limit);

    if (!isAdmin) return { events, totalEvents: 0, totalCategories: 0 };

    const totalEvents = await Event.countDocuments();

    return { events, totalEvents };
  }
}

export default EventService;
