import { ITranslationProvider, ITranslatable } from "../types/translation";
import { GoogleTranslationProvider } from "../providers/GoogleTranslationProvider";

type Path = string[]; // e.g. ['questions', '0', 'text']
type TranslationItem = { path: Path; text: string };

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

  collectPathsToTranslate(obj: any, schema: Path[], currentPath: Path = []): any {
    const result: TranslationItem[] = [];

    for (const path of schema) {
      const fullPath = [...currentPath, ...path];
      this.collectFromPath(obj, fullPath, [], result);
    }

    return result;
  }

  async collectFromPath(obj: any, path: Path, current: Path, result: TranslationItem[]) {
    if (!obj) return;

    const [head, ...tail] = path;

    if (head === "*") {
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          this.collectFromPath(obj[i], tail, [...current, i.toString()], result);
        }
      }
    } else if (tail.length === 0) {
      const value = obj[head];
      if (typeof value === "string") {
        result.push({ path: [...current, head], text: value });
      }
    } else {
      this.collectFromPath(obj[head], tail, [...current, head], result);
    }
  }

  async setValueAtPath(obj: any, path: Path, value: string) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      current[key] = current[key] || {};
      current = current[key];
    }
    current[path[path.length - 1]] = value;
  }

  async translateJsonStructure(
    input: any,
    schema: Path[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<any> {
    // console.log("INPUT : ", input);
    // console.log("Schema : ", schema);
    const clone = JSON.parse(JSON.stringify(input));
    // console.log("Clone : ", clone);
    const pathsToTranslate = this.collectPathsToTranslate(input, schema);
    // console.log("PathsToTranslate : ", pathsToTranslate);
    const texts = pathsToTranslate.map((item: any) => item.text);
    // console.log("Texts : ", texts);
    const translated = await this.provider.translateBatch(
      texts,
      targetLanguage,
      sourceLanguage
    );
    // console.log("Translated Texts : ", translated);

    pathsToTranslate.forEach((item: any, i: number) => {
      this.setValueAtPath(clone, item.path, translated[i].text);
    });

    // console.log("Clone : ", clone);

    return clone;
  }
}
