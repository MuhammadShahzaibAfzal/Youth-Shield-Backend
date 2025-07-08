import { Types } from "mongoose";
import Registration, { IRegistration } from "../models/RegistrationModel";
import Counter from "../models/CounterModel";

class RegistrationService {
  async createRegistration(eventId: string, userId: string): Promise<IRegistration> {
    const registration = new Registration({
      event: new Types.ObjectId(eventId),
      user: new Types.ObjectId(userId),
    });

    return await registration.save();
  }

  async getRegistrationById(id: string): Promise<IRegistration | null> {
    return await Registration.findById(id).populate("event").populate("user");
  }

  async getRegistrationsByEvent(eventId: string, skip: number, limit: number) {
    const registrations = await Registration.find({ event: new Types.ObjectId(eventId) })
      .skip(skip)
      .limit(limit)
      .populate("user", "firstName lastName imageURL email")
      .populate("event")
      .sort({ createdAt: -1 });

    const total = await Registration.countDocuments({
      event: new Types.ObjectId(eventId),
    });

    return {
      registrations,
      total,
    };
  }

  async getRegistrationsByUser(userId: string, skip: number, limit: number) {
    const registrations = await Registration.find({ user: new Types.ObjectId(userId) })
      .skip(skip)
      .limit(limit)
      .populate("event")

      .sort({ createdAt: -1 });
    const total = await Registration.countDocuments({
      user: new Types.ObjectId(userId),
    });

    return {
      registrations,
      total,
    };
  }

  async updateRegistrationStatus(
    id: string,
    status: "pending" | "confirmed" | "cancelled"
  ): Promise<IRegistration | null> {
    return await Registration.findByIdAndUpdate(id, { status }, { new: true });
  }

  async getNextRegistrationNumber(): Promise<string> {
    const counter = await Counter.findById("registrationNumber");
    const nextNumber = counter ? counter.seq + 1 : 1;
    return nextNumber.toString().padStart(4, "0");
  }

  async isUserRegistered(eventId: string, userId: string): Promise<boolean> {
    const existingRegistration = await Registration.findOne({
      event: new Types.ObjectId(eventId),
      user: new Types.ObjectId(userId),
    });
    return !!existingRegistration;
  }

  async cancelRegistration(id: string): Promise<IRegistration | null> {
    return await this.updateRegistrationStatus(id, "cancelled");
  }
}

export default RegistrationService;
