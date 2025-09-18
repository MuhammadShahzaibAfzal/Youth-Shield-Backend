import Config from "../config";
import NewsLetter, { INewsLetter } from "../models/NewsLetterModel";
import { MailNotificationService } from "../types/notification";
import { getNewsletterTemplate } from "../utils/newsLetterEmailTemplate";

class NewsLetterService {
  private mailer: MailNotificationService;

  constructor(mailer: MailNotificationService) {
    this.mailer = mailer;
  }
  async findByEmail(email: string) {
    return await NewsLetter.findOne({ email });
  }
  async subscribe(data: Partial<INewsLetter>) {
    let subscriber = await NewsLetter.findOne({ email: data.email });

    if (subscriber) {
      subscriber.status = "subscribed";
      subscriber.firstName = data.firstName || subscriber.firstName;
      subscriber.lastName = data.lastName || subscriber.lastName;
      await subscriber.save();
    } else {
      subscriber = await NewsLetter.create(data);
    }

    // 🔔 Send notification to admin
    const { html, subject } = getNewsletterTemplate(data);
    try {
      await this.mailer.send({
        to: Config.ADMIN_EMAIL!,
        subject,
        html,
      });
    } catch (err) {
      console.error("Failed to notify admin:", err);
    }

    return subscriber;
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
