import {
  ResourceModel,
  IResourceCategory as ICategory,
  IResource,
  ResourceCategoryModel as CategoryModel,
} from "../models/ResourcesModel";
import mongoose from "mongoose";

class ResourceService {
  async createCategory(data: Partial<ICategory>) {
    return await CategoryModel.create(data);
  }

  async updateCategory(id: string, data: Partial<ICategory>) {
    return await CategoryModel.findByIdAndUpdate(id, data, { new: true });
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
    return await ResourceModel.create(data);
  }

  async updateResource(id: string, data: Partial<IResource>) {
    return await ResourceModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteResource(id: string) {
    return await ResourceModel.findByIdAndDelete(id);
  }

  async getResourceById(id: string) {
    return await ResourceModel.findById(id).populate("categoryId", "name");
  }

  async getAllResources() {
    return await ResourceModel.find()
      .populate("categoryId", "name")
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
    let filter: any = {};

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = categoryId;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { shortDescription: regex }];
    }

    const resources = await ResourceModel.find(filter)
      .populate("categoryId", "name _id")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ResourceModel.countDocuments(filter);

    return { resources, total };
  }

  async getResourcesByCategory(categoryId: string) {
    return await ResourceModel.find({ categoryId }).populate("categoryId", "name");
  }
}

export default ResourceService;
