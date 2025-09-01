import NewsLetter, { INewsLetter } from "../models/NewsLetterModel";

class NewsLetterService {
  async findByEmail(email: string) {
    return await NewsLetter.findOne({ email });
  }
  async subscribe(data: Partial<INewsLetter>) {
    const existing = await NewsLetter.findOne({ email: data.email });
    if (existing) {
      existing.status = "subscribed";
      existing.firstName = data.firstName || existing.firstName;
      existing.lastName = data.lastName || existing.lastName;
      await existing.save();
      return existing;
    }

    const newsletter = await NewsLetter.create(data);
    return newsletter;
  }

  async unsubscribe(email: string) {
    const subscriber = await NewsLetter.findOne({ email });
    if (!subscriber) {
      throw new Error("Subscriber not found");
    }
    subscriber.status = "unsubscribed";
    await subscriber.save();
    return subscriber;
  }

  async getAll() {
    return await NewsLetter.find();
  }

  async getByEmail(email: string) {
    return await NewsLetter.findOne({ email });
  }

  async delete(id: string) {
    return await NewsLetter.findByIdAndDelete(id);
  }
}

export default NewsLetterService;
