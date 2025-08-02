import Config from "../config";
import Category, { ICategoryModel } from "../models/CategoryModel";
import { TranslationService } from "./TranslationService";

class CategoryService {
  constructor(private translationService: TranslationService) {}

  async create(data: Partial<ICategoryModel>) {
    const category = await Category.create(data);

    // Translate immediately after creating
    await this.translateCategory(category, Config.SUPPORTED_LANGUAGES);
  }

  async delete(id: string) {
    await Category.findByIdAndDelete(id);
  }

  async update(id: string, data: Partial<ICategoryModel>) {
    const category = await Category.findById(id);

    if (!category) throw new Error("Category not found");

    const shouldTranslate = typeof data.name === "string";

    if (shouldTranslate) {
      category.name = data.name!;
    }

    if (data.status) category.status = data.status;

    await category.save();

    // Re-translate if name is updated
    if (shouldTranslate) {
      await this.translateCategory(category, Config.SUPPORTED_LANGUAGES);
    }
  }

  async getAll() {
    return Category.find();
  }

  async getBySlug(slug: string) {
    return await Category.findOne({ slug });
  }

  async translateCategory(category: ICategoryModel, languages: string[]): Promise<void> {
    for (const lang of languages) {
      if (!category.translations.get(lang)) {
        const translated = await this.translationService.translateModel(
          category,
          lang,
          "en"
        );

        category.translations.set(lang, {
          name: translated.name,
        });
      }
    }

    await category.save();
  }
}

export default CategoryService;
