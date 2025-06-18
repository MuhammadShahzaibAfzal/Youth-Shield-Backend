import Contest, { IContest } from "../models/ContestModel";

class ContestService {
  async createContest(data: Partial<IContest>) {
    return await Contest.create(data);
  }

  async updateContest(id: string, data: Partial<IContest>) {
    return await Contest.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteContest(id: string) {
    return await Contest.findByIdAndDelete(id);
  }

  async getContestById(id: string) {
    return await Contest.findById(id);
  }

  async getAllContests({
    limit = 10,
    skip = 0,
    status,
    search,
  }: {
    limit?: number;
    skip?: number;
    status?: "active" | "inactive";
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

    const contests = await Contest.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Contest.countDocuments(filter);

    return { contests, total };
  }

  async getContestBySlug(slug: string) {
    return await Contest.findOne({ slug });
  }

  async getRecentContests(limit: number = 5) {
    return await Contest.find({ status: "active" }).sort({ createdAt: -1 }).limit(limit);
  }

  async getActiveContests() {
    return await Contest.find({
      status: "active",
      fromDate: { $lte: new Date() },
      toDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });
  }
}

export default ContestService;
