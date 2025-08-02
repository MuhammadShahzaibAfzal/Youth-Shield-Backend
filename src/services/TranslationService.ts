import { ITranslationProvider, ITranslatable } from "../types/translation";
import { GoogleTranslationProvider } from "../providers/GoogleTranslationProvider";

export class TranslationService {
  private provider: ITranslationProvider;

  constructor(provider?: ITranslationProvider) {
    this.provider = provider || new GoogleTranslationProvider();
  }

  async translateModel<T extends ITranslatable>(
    model: T,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<Record<string, string>> {
    const fields = model.getFieldsToTranslate();
    const translations: Record<string, string> = {};

    for (const field of fields) {
      const value = (model as any)[field];
      if (typeof value === "string") {
        const result = await this.provider.translateText(
          value,
          targetLanguage,
          sourceLanguage
        );
        translations[field] = result.text;
      }
    }

    return translations;
  }

  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string> {
    const result = await this.provider.translateText(
      text,
      targetLanguage,
      sourceLanguage
    );
    return result.text;
  }
}
