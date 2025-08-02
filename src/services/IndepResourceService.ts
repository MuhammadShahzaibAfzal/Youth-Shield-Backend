import {
  IndepResourceModel,
  IndepCategoryModel,
  IIndepResource,
  IIndepCategory,
} from "../models/IndepResourcesModel";
import mongoose from "mongoose";

class IndependentResourceService {
  async createCategory(data: Partial<IIndepCategory>) {
    return await IndepCategoryModel.create(data);
  }

  async updateCategory(id: string, data: Partial<IIndepCategory>) {
    return await IndepCategoryModel.findByIdAndUpdate(id, data, { new: true });
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
    return await IndepResourceModel.create(data);
  }

  async updateResource(id: string, data: Partial<IIndepResource>) {
    return await IndepResourceModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteResource(id: string) {
    return await IndepResourceModel.findByIdAndDelete(id);
  }

  async getResourceById(id: string) {
    return await IndepResourceModel.findById(id).populate("categoryId", "name");
  }

  async getAllResources() {
    return await IndepResourceModel.find()
      .populate("categoryId", "name description icon")
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
      .populate("categoryId", "name _id icon description")
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
