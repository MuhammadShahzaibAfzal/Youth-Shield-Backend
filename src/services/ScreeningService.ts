import Config from "../config";
import Screening, { IScreening, ITranslation } from "../models/ScreeningModel";
import { TranslationService } from "./TranslationService";

class ScreeningService {
  constructor(private translationService: TranslationService) {}
  async createScreening(data: Partial<IScreening>) {
    const screening = await Screening.create(data);

    const schema = [
      ["name"],
      ["overview"],
      ["purpose"],
      ["duration"],
      ["benefits", "*", "name"],
    ];
    const input = {
      name: data.name,
      overview: data.overview,
      purpose: data.purpose,
      duration: data.duration,
      benefits: data.benefits?.map((b) => {
        return {
          name: b,
        };
      }),
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
      const formatedResult = {
        name: result.name,
        overview: result.overview,
        purpose: result.purpose,
        duration: result.duration,
        benefits: result.benefits?.map((b: any) => b.name),
      };
      translations.set(lang, formatedResult);
    });
    // console.log("translations", translations);

    await Screening.findByIdAndUpdate(screening._id, { translations });

    return screening;
  }

  async updateScreening(
    id: string,
    data: Partial<IScreening>
  ): Promise<IScreening | null> {
    // TODO: ONLY TRANSLATE UPDATE VALUE AND ADD QUESTIONS and INTERPRETATIONS
    const schema = [
      ["name"],
      ["overview"],
      ["purpose"],
      ["duration"],
      ["benefits", "*", "name"],
      ["questions", "*", "text"],
      ["questions", "*", "options", "*", "text"],
      ["interpretations", "*", "name"],
      ["interpretations", "*", "proposedSolution"],
    ];

    const input = {
      name: data.name,
      overview: data.overview,
      purpose: data.purpose,
      duration: data.duration,
      benefits: data?.benefits?.map((b) => {
        return {
          name: b,
        };
      }),
      questions: data?.questions?.map((q) => {
        return {
          text: q.text,
          options:
            q.options?.map((o) => {
              return {
                text: o.text,
              };
            }) || [],
        };
      }),
      interpretations: data?.interpretations?.map((i) => {
        return {
          name: i.name,
          proposedSolution: i.proposedSolution,
        };
      }),
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
      const formatedResult = {
        name: result.name,
        overview: result.overview,
        purpose: result.purpose,
        duration: result.duration,
        benefits: result.benefits?.map((b: any) => b.name),
        questions: result.questions?.map((q: any, index: number) => {
          const selectedQuestion = data.questions?.[index];

          return {
            _id: selectedQuestion?._id,
            text: q.text,
            options: q.options?.map((o: any, index: number) => {
              const selectedOption = selectedQuestion?.options?.[index];
              return {
                text: o.text,
                _id: selectedOption?._id,
              };
            }),
          };
        }),
        interpretations: result.interpretations?.map((i: any, index: any) => {
          const selectedInterpretation = data.interpretations?.[index];
          return {
            name: i.name,
            proposedSolution: i.proposedSolution,
            _id: selectedInterpretation?._id,
          };
        }),
      };
      translations.set(lang, formatedResult);
    });

    return await Screening.findByIdAndUpdate(
      id,
      {
        ...data,
        translations,
      },
      { new: true }
    );
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
