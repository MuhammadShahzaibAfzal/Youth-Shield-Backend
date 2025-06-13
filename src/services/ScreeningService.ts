import Screening, { IScreening } from "../models/ScreeningModel";

class ScreeningService {
  async createScreening(data: Partial<IScreening>) {
    return await Screening.create(data);
  }

  async updateScreening(id: string, data: Partial<IScreening>) {
    return await Screening.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteScreening(id: string) {
    return await Screening.findByIdAndDelete(id);
  }

  async getScreeningById(id: string) {
    return await Screening.findById(id);
  }

  async getAllScreenings({
    limit = 10,
    skip = 0,
    status,
    search,
  }: {
    limit?: number;
    skip?: number;
    status?: "active" | "inactive" | "draft";
    search?: string;
  } = {}) {
    const filter: any = {};

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const screenings = await Screening.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Screening.countDocuments(filter);

    return { screenings, total };
  }

  async getScreeningBySlug(slug: string) {
    return await Screening.findOne({ slug });
  }

  async getRecentScreenings(limit: number = 5) {
    return await Screening.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async changeScreeningStatus(
    screeningId: string,
    status: "active" | "inactive" | "draft"
  ) {
    return await Screening.findByIdAndUpdate(screeningId, { status }, { new: true });
  }
}

export default ScreeningService;
