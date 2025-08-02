import ResearchRegistration, {
  IResearchRegistration,
} from "../models/RegisterResearchModel";

interface GetResearchRegistrationsParams {
  limit: number;
  skip: number;
  search?: string;
}
class ResearchRegistrationService {
  async create(data: Partial<IResearchRegistration>) {
    return await ResearchRegistration.create(data);
  }

  async delete(id: string) {
    return await ResearchRegistration.findByIdAndDelete(id);
  }

  async update(id: string, data: Partial<IResearchRegistration>) {
    return await ResearchRegistration.findByIdAndUpdate(id, data, { new: true });
  }

  async getAllResearchRegistrations({
    limit,
    skip,
    search,
  }: GetResearchRegistrationsParams) {
    const filter: any = {};

    // Full-text search by firstName, highSchool, city, or selectedResearch
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { firstName: regex },
        { highSchool: regex },
        { city: regex },
        { selectedResearch: regex },
      ];
    }

    const registrations = await ResearchRegistration.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ResearchRegistration.countDocuments(filter);

    return { registrations, total };
  }

  async getById(id: string) {
    return await ResearchRegistration.findById(id);
  }
}

export default ResearchRegistrationService;
