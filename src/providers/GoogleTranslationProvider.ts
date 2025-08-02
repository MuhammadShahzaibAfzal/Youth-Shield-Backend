import { Translate } from "@google-cloud/translate/build/src/v2";
import { ITranslationProvider, ITranslationResult } from "../types/translation";
import Config from "../config";

export class GoogleTranslationProvider implements ITranslationProvider {
  private translator: Translate;

  constructor() {
    this.translator = new Translate({
      projectId: Config.GOOGLE_PROJECT_ID,
    });
  }

  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<ITranslationResult> {
    const [translation] = await this.translator.translate(text, {
      from: sourceLanguage,
      to: targetLanguage,
    });

    return {
      text: translation,
      sourceLanguage: sourceLanguage || "auto",
      targetLanguage,
    };
  }

  async translateBatch(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<ITranslationResult[]> {
    const [translations] = await this.translator.translate(texts, {
      from: sourceLanguage,
      to: targetLanguage,
    });

    return translations.map((text, i) => ({
      text,
      sourceLanguage: sourceLanguage || "auto",
      targetLanguage,
    }));
  }
}
