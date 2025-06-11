import mongoose, { Document, Types } from "mongoose";

export interface IWebinar extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  time: string;
  image: string;
  link?: string;
  onDemand: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const webinarSchema = new mongoose.Schema<IWebinar>(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: false },
    time: { type: String, required: false },
    image: { type: String, required: true },
    link: { type: String },
    onDemand: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Webinar = mongoose.model<IWebinar>("Webinar", webinarSchema);
export default Webinar;
