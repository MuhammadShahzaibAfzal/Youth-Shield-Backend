import Category, { ICategoryModel } from "../models/CategoryModel";

class CategoryService {
  async create(data: Partial<ICategoryModel>) {
    await Category.create(data);
  }

  async delete(id: string) {
    await Category.findByIdAndDelete(id);
  }

  async update(id: string, data: Partial<ICategoryModel>) {
    await Category.findByIdAndUpdate(id, data);
  }

  async getAll() {
    return Category.find();
  }

  async getBySlug(slug: string) {
    return await Category.findOne({ slug });
  }
}

export default CategoryService;
