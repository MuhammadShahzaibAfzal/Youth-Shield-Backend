import { format, startOfDay } from "date-fns";
import Webinar, { IWebinar } from "../models/WebinarsModel";

class WebinarService {
  async createWebinar(data: Partial<IWebinar>) {
    return await Webinar.create(data);
  }

  async updateWebinar(id: string, data: Partial<IWebinar>) {
    return await Webinar.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteWebinar(id: string) {
    return await Webinar.findByIdAndDelete(id);
  }

  async getWebinarById(id: string) {
    return await Webinar.findById(id);
  }

  async getAllWebinars() {
    return await Webinar.find({}).sort({ date: -1, time: -1 });
  }

  async getUpcomingWebinars(limit?: number) {
    const now = new Date();
    const today = startOfDay(now);
    const currentTime = format(now, "HH:mm");
    const query = Webinar.find({
      $or: [
        { onDemand: true },
        {
          $and: [
            { onDemand: { $ne: true } },
            {
              $or: [
                { date: { $gt: today } },
                { date: today, time: { $gt: currentTime } },
              ],
            },
          ],
        },
      ],
    }).sort({ date: 1, time: 1 });

    if (limit) {
      query.limit(limit);
    }

    return await query.exec();
  }

  async getPastWebinars(limit?: number) {
    const now = new Date();
    const query = Webinar.find({ date: { $lt: now } }).sort({ date: -1, time: -1 });

    if (limit) {
      query.limit(limit);
    }

    return await query.exec();
  }

  async getPaginatedWebinars({ limit, skip }: { limit: number; skip: number }) {
    const webinars = await Webinar.find()
      .skip(skip)
      .limit(limit)
      .sort({ date: -1, time: -1 });
    const total = await Webinar.countDocuments();

    return { webinars, total };
  }
}

export default WebinarService;
