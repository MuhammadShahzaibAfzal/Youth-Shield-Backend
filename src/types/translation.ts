export interface ITranslationResult {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface ITranslationProvider {
  translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<ITranslationResult>;

  translateBatch(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<ITranslationResult[]>;
}

export interface ITranslatable {
  getFieldsToTranslate(): string[];
}
