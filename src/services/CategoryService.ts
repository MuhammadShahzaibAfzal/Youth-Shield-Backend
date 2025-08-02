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
    try {
      // 2. Prepare batch translation requests
      const translationPromises = languages?.map(async (lang) => {
        // 3. Use the translation service with error handling
        const translatedName = await this.translationService
          .translateText(category.name, lang, "en")
          .catch((error) => {
            console.error(`Failed to translate to ${lang}:`, error);
            return null; // Mark failed translations
          });

        if (translatedName) {
          return {
            lang,
            translation: {
              name: translatedName,
            },
          };
        }
        return null;
      });

      // 4. Execute all translations in parallel
      const results = await Promise.all(translationPromises);

      // 5. Apply successful translations
      results.forEach((result) => {
        if (result) {
          category.translations.set(result.lang, result.translation);
        }
      });

      // 6. Save only once after all translations
      await category.save();
    } catch (error: any) {
      console.error("Error during batch translation:", error);
      throw new Error(`Category translation failed: ${error.message}`);
    }
  }
}

export default CategoryService;
