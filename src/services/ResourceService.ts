import {
  ResourceModel,
  IResourceCategory as ICategory,
  IResource,
  ResourceCategoryModel as CategoryModel,
  IResourceTranslationCategory,
  IResourceTranslation,
} from "../models/ResourcesModel";
import mongoose from "mongoose";
import { TranslationService } from "./TranslationService";
import Config from "../config";

class ResourceService {
  constructor(private translationService: TranslationService) {}
  async createCategory(data: Partial<ICategory>) {
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

    return await CategoryModel.create({
      ...data,
      translations,
    });
  }

  async updateCategory(id: string, data: Partial<ICategory>) {
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
    return await CategoryModel.findByIdAndUpdate(
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
    // await ResourceModel.deleteMany({ categoryId: id });
    return await CategoryModel.findByIdAndDelete(id);
  }

  async getAllCategories() {
    return await CategoryModel.find().sort({ name: 1 }); // Alphabetical order
  }

  async getCategoryById(id: string) {
    return await CategoryModel.findById(id);
  }

  async createResource(data: Partial<IResource>) {
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
    return await ResourceModel.create({
      ...data,
      translations,
    });
  }

  async updateResource(id: string, data: Partial<IResource>) {
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
    return await ResourceModel.findByIdAndUpdate(
      id,
      {
        ...data,
        translations,
      },
      { new: true }
    );
  }

  async deleteResource(id: string) {
    return await ResourceModel.findByIdAndDelete(id);
  }

  async getResourceById(id: string) {
    return await ResourceModel.findById(id).populate("categoryId", "name");
  }

  async getAllResources() {
    return await ResourceModel.find().populate("categoryId").sort({ createdAt: -1 });
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
    let filter: any = {};

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = categoryId;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { shortDescription: regex }];
    }

    const resources = await ResourceModel.find(filter)
      .populate("categoryId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ResourceModel.countDocuments(filter);

    return { resources, total };
  }

  async getResourcesByCategory(categoryId: string) {
    return await ResourceModel.find({ categoryId }).populate("categoryId");
  }
}

export default ResourceService;
