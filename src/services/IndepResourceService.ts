import {
  IndepResourceModel,
  IndepCategoryModel,
  IIndepResource,
  IIndepCategory,
  IResourceTranslationCategory,
  IResourceTranslation,
} from "../models/IndepResourcesModel";
import mongoose from "mongoose";
import { TranslationService } from "./TranslationService";
import Config from "../config";

class IndependentResourceService {
  constructor(private translationService: TranslationService) {}
  async createCategory(data: Partial<IIndepCategory>) {
    const schema = [["name"], ["description"]];
    const input = { name: data.name, description: data.description };
    const translations = new Map<string, IResourceTranslationCategory>();
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
    return await IndepCategoryModel.create({
      ...data,
      translations,
    });
  }

  async updateCategory(id: string, data: Partial<IIndepCategory>) {
    const schema = [["name"], ["description"]];
    const input = { name: data.name, description: data.description };
    const translations = new Map<string, IResourceTranslationCategory>();
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
    return await IndepCategoryModel.findByIdAndUpdate(
      id,
      {
        ...data,
        translations,
      },
      { new: true }
    );
  }

  async deleteCategory(id: string) {
    // Optional: Also delete all resources under this category
    // await IndepResourceModel.deleteMany({ categoryId: id });
    return await IndepCategoryModel.findByIdAndDelete(id);
  }

  async getAllCategories() {
    return await IndepCategoryModel.find().sort({ name: 1 });
  }

  async getCategoryById(id: string) {
    return await IndepCategoryModel.findById(id);
  }

  async createResource(data: Partial<IIndepResource>) {
    const schema = [["name"], ["shortDescription"]];
    const input = { name: data.name, shortDescription: data.shortDescription };
    const translations = new Map<string, IResourceTranslation>();
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
    return await IndepResourceModel.create({
      ...data,
      translations,
    });
  }

  async updateResource(id: string, data: Partial<IIndepResource>) {
    const schema = [["name"], ["shortDescription"]];
    const input = { name: data.name, shortDescription: data.shortDescription };
    const translations = new Map<string, IResourceTranslation>();
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
    return await IndepResourceModel.findByIdAndUpdate(
      id,
      {
        ...data,
        translations,
      },
      { new: true }
    );
  }

  async deleteResource(id: string) {
    return await IndepResourceModel.findByIdAndDelete(id);
  }

  async getResourceById(id: string) {
    return await IndepResourceModel.findById(id).populate("categoryId", "name");
  }

  async getAllResources() {
    return await IndepResourceModel.find()
      .populate("categoryId", "name description icon translations")
      .sort({ createdAt: -1 });
  }

  async getResources({
    limit,
    skip,
    categoryId,
    search,
  }: {
    limit: number;
    skip: number;
    categoryId?: string;
    search?: string;
  }) {
    const filter: any = {};

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = categoryId;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { shortDescription: regex }];
    }

    const resources = await IndepResourceModel.find(filter)
      .populate("categoryId", "name _id icon description translations")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await IndepResourceModel.countDocuments(filter);

    return { resources, total };
  }

  async getResourcesByCategory(categoryId: string) {
    return await IndepResourceModel.find({ categoryId }).populate("categoryId", "name");
  }
}

export default IndependentResourceService;
