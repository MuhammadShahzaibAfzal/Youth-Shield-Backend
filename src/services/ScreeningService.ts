import Config from "../config";
import Screening, { IScreening, ITranslation } from "../models/ScreeningModel";
import { TranslationService } from "./TranslationService";

class ScreeningService {
  constructor(private translationService: TranslationService) {}
  async createScreening(data: Partial<IScreening>) {
    const screening = await Screening.create(data);

    const schema = [["name"], ["overview"], ["purpose"], ["duration"], ["benefits", "*"]];
    const input = {
      name: data.name,
      overview: data.overview,
      purpose: data.purpose,
      duration: data.duration,
      benefits: data.benefits,
    };

    const translations = new Map<string, ITranslation>();
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
    // console.log("translations", translations);

    await Screening.findByIdAndUpdate(screening._id, { translations });

    return screening;
  }

  async updateScreening(
    id: string,
    data: Partial<IScreening>
  ): Promise<IScreening | null> {
    return await Screening.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteScreening(id: string) {
    return await Screening.findByIdAndDelete(id);
  }

  async getScreeningById(id: string) {
    return await Screening.findById(id);
  }

  async getAllScreenings({
    limit = 10,
    skip = 0,
    status,
    search,
  }: {
    limit?: number;
    skip?: number;
    status?: "active" | "inactive" | "draft";
    search?: string;
  } = {}) {
    const filter: any = {};

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const screenings = await Screening.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Screening.countDocuments(filter);

    return { screenings, total };
  }

  async getScreeningBySlug(slug: string) {
    return await Screening.findOne({ slug });
  }

  async getRecentScreenings(limit: number = 5) {
    return await Screening.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async changeScreeningStatus(
    screeningId: string,
    status: "active" | "inactive" | "draft"
  ) {
    return await Screening.findByIdAndUpdate(screeningId, { status }, { new: true });
  }
}

export default ScreeningService;
