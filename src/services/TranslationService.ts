import { ITranslationProvider, ITranslatable } from "../types/translation";
import { GoogleTranslationProvider } from "../providers/GoogleTranslationProvider";
import { IScreening, ITranslation } from "../models/ScreeningModel";

type TranslatableText = {
  path: string[]; // Path to the field in the object
  text: string; // Text to translate
};
type TranslationMap = {
  [path: string]: string; // Map of paths to translated texts
};

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

  // SCREENING TRANSLATIONS LOGIC
  private async collectTextsFromScreening(
    screening: IScreening
  ): Promise<TranslatableText[]> {
    const texts: TranslatableText[] = [];
    const fields = screening.getFieldsToTranslate();

    // Helper function to add text with path
    const addText = (text: string, ...path: string[]) => {
      if (text && typeof text === "string") {
        texts.push({ path, text });
      }
    };

    // Simple fields
    if (fields.includes("name")) addText(screening.name, "name");
    if (fields.includes("description"))
      addText(screening.description || "", "description");
    if (fields.includes("overview")) addText(screening.overview || "", "overview");
    if (fields.includes("purpose")) addText(screening.purpose || "", "purpose");
    if (fields.includes("duration")) addText(screening.duration || "", "duration");

    // Benefits array
    if (fields.includes("benefits") && screening.benefits) {
      screening.benefits.forEach((benefit, i) => {
        addText(benefit, "benefits", i.toString());
      });
    }

    // Questions
    if (fields.includes("questions") && screening.questions) {
      screening.questions.forEach((question, qIndex) => {
        addText(question.text, "questions", qIndex.toString(), "text");

        // Question options
        if (question.options) {
          question.options.forEach((option, oIndex) => {
            addText(
              option.text,
              "questions",
              qIndex.toString(),
              "options",
              oIndex.toString(),
              "text"
            );
          });
        }

        // Height options
        if (question.heightOptions) {
          question.heightOptions.forEach((heightOption, hIndex) => {
            addText(
              heightOption.height,
              "questions",
              qIndex.toString(),
              "heightOptions",
              hIndex.toString(),
              "height"
            );

            // Weights
            if (heightOption.weights) {
              heightOption.weights.forEach((weightOption, wIndex) => {
                addText(
                  weightOption.weight,
                  "questions",
                  qIndex.toString(),
                  "heightOptions",
                  hIndex.toString(),
                  "weights",
                  wIndex.toString(),
                  "weight"
                );
              });
            }
          });
        }
      });
    }

    // Interpretations
    if (fields.includes("interpretations") && screening.interpretations) {
      screening.interpretations.forEach((level, lIndex) => {
        addText(level.name, "interpretations", lIndex.toString(), "name");
        addText(
          level.proposedSolution,
          "interpretations",
          lIndex.toString(),
          "proposedSolution"
        );
      });
    }

    return texts;
  }

  private applyTranslations(
    screening: IScreening,
    translations: TranslationMap
  ): IScreening["translations"] {
    const translatedScreening = JSON.parse(
      JSON.stringify(screening)
    ) as Partial<IScreening>;
    const translatedFields: Partial<ITranslation> = {};

    Object.entries(translations).forEach(([path, translatedText]) => {
      const pathParts = path.split(".");
      let current: any = translatedFields;

      // Navigate through the path to set the translated value
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        current[part] = current[part] || (isNaN(Number(pathParts[i + 1])) ? {} : []);
        current = current[part];
      }

      current[pathParts[pathParts.length - 1]] = translatedText;
    });

    return translatedFields as IScreening["translations"];
  }

  async translateScreening(
    screening: IScreening,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<IScreening["translations"]> {
    // Step 1: Collect all texts to translate with their paths
    const translatableTexts = await this.collectTextsFromScreening(screening);

    // Step 2: Batch translate all texts at once
    const textsToTranslate = translatableTexts.map((item) => item.text);
    const translationResults = await this.provider.translateBatch(
      textsToTranslate,
      targetLanguage,
      sourceLanguage
    );

    // Step 3: Create a map of paths to translated texts
    const translationsMap: TranslationMap = {};
    translatableTexts.forEach((item, index) => {
      translationsMap[item.path.join(".")] = translationResults[index].text;
    });

    // Step 4: Apply translations to create the translated structure
    return this.applyTranslations(screening, translationsMap);
  }

  async translateScreeningFields(
    screening: IScreening,
    fieldsToTranslate: string[],
    targetLanguages: string[],
    sourceLanguage: string = "en"
  ): Promise<Partial<IScreening["translations"]>> {
    const allTexts = await this.collectTextsFromScreening(screening);

    const relevantTexts = allTexts.filter((item) =>
      fieldsToTranslate.some((field) => item.path[0] === field)
    );

    const translationsByLang: Record<string, any> = {};

    for (const lang of targetLanguages) {
      const existingTranslation = screening.translations?.get(lang);
      const needsTranslation = !existingTranslation;

      const batchTexts = relevantTexts.map((item) => item.text);
      const translatedResults = await this.provider.translateBatch(
        batchTexts,
        lang,
        sourceLanguage
      );

      const translationMap: TranslationMap = {};
      relevantTexts.forEach((item, index) => {
        translationMap[item.path.join(".")] = translatedResults[index].text;
      });

      translationsByLang[lang] = this.applyTranslations(screening, translationMap);
    }

    return translationsByLang;
  }
}
