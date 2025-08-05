import Config from "../config";
import Contest, { IContest, ITranslation } from "../models/ContestModel";
import { TranslationService } from "./TranslationService";

class ContestService {
  constructor(private translationService: TranslationService) {}
  async createContest(data: Partial<IContest>) {
    const schema = [["name"], ["description"]];
    const input = { name: data.name, description: data.description };

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

    return await Contest.create({
      ...data,
      translations,
    });
  }

  async updateContest(id: string, data: Partial<IContest>) {
    const schema = [
      ["name"],
      ["description"],
      ["questions", "*", "text"],
      ["questions", "*", "options", "*", "text"],
    ];
    const input = {
      name: data.name,
      description: data.description,
      questions:
        data?.questions?.map((q) => {
          return {
            text: q.text,
            options: q.options?.map((o) => {
              return { text: o.text };
            }),
          };
        }) || [],
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
      const formattedResult = {
        name: result.name,
        description: result.description,
        questions: result.questions?.map((q: any, index: number) => {
          const selectedQuestion = data.questions?.[index];
          return {
            text: q.text,
            _id: selectedQuestion?._id,
            options: q.options?.map((o: any, index: number) => {
              const selectedOption = selectedQuestion?.options?.[index];
              return { text: o.text, _id: selectedOption?._id };
            }),
          };
        }),
      };
      translations.set(lang, formattedResult);
    });

    return await Contest.findByIdAndUpdate(
      id,
      {
        ...data,
        translations,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async deleteContest(id: string) {
    return await Contest.findByIdAndDelete(id);
  }

  async getContestById(id: string) {
    return await Contest.findById(id);
  }

  async getAllContests({
    limit = 10,
    skip = 0,
    status,
    search,
  }: {
    limit?: number;
    skip?: number;
    status?: "active" | "inactive";
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

    const contests = await Contest.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Contest.countDocuments(filter);

    return { contests, total };
  }

  async getContestBySlug(slug: string) {
    return await Contest.findOne({ slug });
  }

  async getRecentContests(limit: number = 5) {
    return await Contest.find({ status: "active" }).sort({ createdAt: -1 }).limit(limit);
  }

  async getActiveContests() {
    return await Contest.find({
      status: "active",
      fromDate: { $lte: new Date() },
      toDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });
  }
}

export default ContestService;
