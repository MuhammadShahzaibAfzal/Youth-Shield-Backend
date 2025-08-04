import Config from "../config";
import Screening, { IScreening } from "../models/ScreeningModel";
import { TranslationService } from "./TranslationService";

class ScreeningService {
  constructor(private translationService: TranslationService) {}
  async createScreening(data: Partial<IScreening>) {
    const screening = await Screening.create(data);

    // Then translate to all supported languages in parallel
    const translationPromises = Config.SUPPORTED_LANGUAGES.map(async (language) => {
      try {
        const translation = await this.translationService.translateScreening(
          screening,
          language,
          "en"
        );
        return { language, translation };
      } catch (error) {
        console.error(`Failed to translate screening to ${language}:`, error);
        return null; // Skip failed translations
      }
    });

    // Wait for all translations to complete
    const translationResults = await Promise.all(translationPromises);

    console.log("Translation Result : ", translationResults);

    // Update the screening with successful translations
    const translationsMap = new Map<string, any>();

    translationResults.forEach((result) => {
      if (result) {
        translationsMap.set(result.language, result.translation);
      }
    });
    console.log("Translation Map : ", translationsMap);

    if (translationsMap.size > 0) {
      console.log("Translation Map Size : ", translationsMap.size);
      await Screening.findByIdAndUpdate(screening._id, {
        translations: translationsMap,
      });
    }

    return screening;
  }

  async updateScreening(
    id: string,
    data: Partial<IScreening>,
    options: {
      translate?: boolean;
      newLanguages?: string[];
    } = {}
  ): Promise<IScreening | null> {
    const screening = await Screening.findById(id);
    if (!screening) throw new Error("Screening not found");

    // Identify which fields are actually changing
    const changedFields: string[] = [];
    const translatableFields = screening.getFieldsToTranslate();

    for (const field of translatableFields) {
      if (field in data && (data as any)[field] !== (screening as any)[field]) {
        changedFields.push(field);
      }
    }

    Object.assign(screening, data);
    await screening.save();

    if (options.translate && changedFields.length > 0) {
      const targetLangs = options.newLanguages?.length
        ? options.newLanguages
        : Config.SUPPORTED_LANGUAGES;

      const translated = await this.translationService.translateScreeningFields(
        screening,
        changedFields,
        targetLangs
      );

      for (const lang of Object.keys(translated)) {
        screening.translations = screening.translations || new Map();
        screening.translations.set(lang, {
          ...(screening.translations.get(lang) || {}),
          // @ts-ignore
          ...translated[lang],
        });
      }

      await screening.save();
    }

    return screening;
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
