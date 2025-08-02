import ResearchRegistration, {
  IResearchRegistration,
} from "../models/RegisterResearchModel";

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

  async getAll() {
    return await ResearchRegistration.find().populate("highSchool");
  }

  async getById(id: string) {
    return await ResearchRegistration.findById(id).populate("highSchool");
  }
}

export default ResearchRegistrationService;
