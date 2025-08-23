import mongoose from "mongoose";
import School, { ISchool } from "../models/SchoolModel";

class SchoolService {
  async findOrCreate(data: string | mongoose.Types.ObjectId, isApproved?: boolean) {
    // Case 1: If data is an ObjectId (existing school reference)
    if (mongoose.isValidObjectId(data)) {
      const school = await School.findById(data);
      if (!school) {
        throw new Error("School not found");
      }
      return school;
    }

    // Case 2: If data is a string (school name)
    if (typeof data === "string") {
      const normalizedName = data.trim().toLowerCase();
      let school = await School.findOne({ name: normalizedName });

      if (!school) {
        school = await School.create({ name: normalizedName, isApproved: isApproved });
      }

      return school;
    }

    throw new Error("Invalid school data provided");
  }

  async getSchools({ query, limit }: { query: string; limit: number }) {
    const schools = await School.find({
      name: { $regex: query, $options: "i" },
      isApproved: true,
    }).limit(limit);
    return schools;
  }

  async getAdminSchools({
    query = "",
    limit,
    skip,
  }: {
    query: string;
    limit: number;
    skip: number;
  }) {
    const schools = await School.find({ name: { $regex: query, $options: "i" } })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await School.countDocuments({ name: { $regex: query, $options: "i" } });
    return {
      schools,
      total,
    };
  }

  async create(data: Partial<ISchool>) {
    return await School.create(data);
  }

  async update(id: string, data: Partial<ISchool>) {
    return await School.findByIdAndUpdate(id, data, { new: true });
  }

  async changeStatusMany(ids: string[], isApproved: boolean) {
    return await School.updateMany({ _id: { $in: ids } }, { isApproved });
  }
}

export default SchoolService;
