import mongoose, { Schema, Types, Document } from "mongoose";
import Counter from "./CounterModel";

export interface IRegistration extends Document {
  registrationNumber: string;
  event: Types.ObjectId;
  user: Types.ObjectId;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    registrationNumber: { type: String, unique: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

type RegistrationDocument = IRegistration & mongoose.Document;

registrationSchema.pre<RegistrationDocument>("save", async function (next) {
  if (!this.isNew || this.registrationNumber) return next();

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "registrationNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.registrationNumber = counter.seq.toString().padStart(4, "0");
    next();
  } catch (error: any) {
    next(error);
  }
});

const Registration = mongoose.model<IRegistration>("Registration", registrationSchema);

export default Registration;
