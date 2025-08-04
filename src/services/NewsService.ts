import News, { INews, INewsTranslation } from "../models/NewsModel";
import Category from "../models/CategoryModel";
import Screening from "../models/ScreeningModel";
import Event from "../models/EventModel";
import { TranslationService } from "./TranslationService";
import Config from "../config";

class NewsService {
  constructor(private translationService: TranslationService) {}
  async createNews(data: Partial<INews>) {
    const schema = [
      ["title"],
      ["content"],
      ["shortDescription"],
      ["SEO", "metaTitle"],
      ["SEO", "metaDescription"],
    ];
    const input = {
      title: data.title,
      content: data.content,
      shortDescription: data.shortDescription,
      SEO: {
        metaTitle: data?.SEO?.metaTitle || data.title,
        metaDescription: data?.SEO?.metaDescription || data.shortDescription,
      },
    };

    const translations = new Map<string, INewsTranslation>();
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
    return await News.create({
      ...data,
      translations,
    });
  }

  async updateNews(id: string, data: Partial<INews>) {
    const schema = [
      ["title"],
      ["content"],
      ["shortDescription"],
      ["SEO", "metaTitle"],
      ["SEO", "metaDescription"],
    ];
    const input = {
      title: data.title,
      content: data.content,
      shortDescription: data.shortDescription,
      SEO: {
        metaTitle: data?.SEO?.metaTitle || data.title,
        metaDescription: data?.SEO?.metaDescription || data.shortDescription,
      },
    };

    const translations = new Map<string, INewsTranslation>();
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
    return await News.findByIdAndUpdate(
      id,
      {
        ...data,
        translations,
      },
      { new: true }
    );
  }

  async deleteNews(id: string) {
    return await News.findByIdAndDelete(id);
  }

  async getNewsById(id: string) {
    return await News.findById(id).populate("category");
  }

  async getAll() {
    return await News.find({}).sort({ createdAt: -1 }).populate("category");
  }

  async getNews({
    limit,
    skip,
    categorySlug,
  }: {
    limit: number;
    skip: number;
    categorySlug?: string;
  }) {
    let categoryFilter = {};

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        categoryFilter = { category: category._id };
      } else {
        return { news: [], total: 0 };
      }
    }
    const news = await News.find(categoryFilter)
      .skip(skip)
      .limit(limit)
      .populate("category")
      .sort({ createdAt: -1 });
    const total = await News.countDocuments(categoryFilter);

    return { news, total };
  }

  async getBySlug(slug: string) {
    return await News.findOne({ "SEO.slug": slug }).populate("category");
  }

  async getRecent(limit: number, isAdmin: boolean = false) {
    const news = await News.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category");
    if (!isAdmin) return { news, totalNews: 0, totalCategories: 0 };
    const totalNews = await News.countDocuments();
    const upcommingEvents = await Event.find({ eventDate: { $gte: new Date() } })
      .limit(5)
      .sort({ eventDate: 1 });
    const totalCategories = await Category.countDocuments({ status: "active" });
    const totalScreenings = await Screening.countDocuments({ status: "active" });
    return { news, totalNews, totalCategories, totalScreenings, upcommingEvents };
  }
}

export default NewsService;
