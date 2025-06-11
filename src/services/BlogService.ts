import Blog, { IBlog } from "../models/BlogModel";
import Category from "../models/CategoryModel";

class BlogService {
  async createBlog(data: Partial<IBlog>) {
    return await Blog.create(data);
  }

  async updateBlog(id: string, data: Partial<IBlog>) {
    return await Blog.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteBlog(id: string) {
    return await Blog.findByIdAndDelete(id);
  }

  async getBlogById(id: string) {
    return await Blog.findById(id).populate("category");
  }

  async getAll() {
    return await Blog.find({}).sort({ createdAt: -1 }).populate("category");
  }

  async getBlogs({
    limit,
    skip,
    categorySlug,
  }: {
    limit: number;
    skip: number;
    categorySlug?: string;
  }) {
    let categoryFilter = {};

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        categoryFilter = { category: category._id };
      } else {
        return { blogs: [], total: 0 };
      }
    }
    const blogs = await Blog.find(categoryFilter)
      .skip(skip)
      .limit(limit)
      .populate("category")
      .sort({ createdAt: -1 });
    const total = await Blog.countDocuments(categoryFilter);

    return { blogs, total };
  }

  async getBySlug(slug: string) {
    return await Blog.findOne({ "SEO.slug": slug }).populate("category");
  }

  async getRecent(limit: number, isAdmin: boolean = false) {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category");
    if (!isAdmin) return { blogs, totalBlogs: 0, totalCategories: 0 };
    const totalBlogs = await Blog.countDocuments();
    const totalCategories = await Category.countDocuments({ status: "active" });
    return { blogs, totalBlogs, totalCategories };
  }
}

export default BlogService;
