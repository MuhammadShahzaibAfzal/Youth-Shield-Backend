import mongoose, { Document } from "mongoose";

export interface ITranslateSEO {
  metaTitle: string;
  metaDescription: string;
}

export interface IEventSEO {
  metaTitle: string;
  slug: string;
  metaDescription: string;
}

export interface IEventTranslation {
  title: string;
  content?: string;
  summary?: string;
  SEO: ITranslateSEO;
}

export interface IEvent extends Document {
  _id: string;
  title: string;
  summary: string;
  content?: string;
  image: string;
  cardImage: string;
  type: "virtual" | "physical";
  location?: string;
  isFeatured: boolean;
  eventDate: Date;
  status: "publish" | "draft";
  registrationLink?: string;
  createdAt: Date;
  updatedAt: Date;
  SEO: IEventSEO;

  translations: Map<string, IEventTranslation>;
}

const eventSchema = new mongoose.Schema<IEvent>(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: false },
    image: { type: String },
    cardImage: { type: String },
    type: { type: String, enum: ["virtual", "physical"], required: true },
    location: { type: String, required: false },
    eventDate: { type: Date, required: true },
    status: { type: String, enum: ["publish", "draft"], default: "draft" },
    isFeatured: { type: Boolean, default: false },
    registrationLink: { type: String },
    SEO: {
      metaTitle: { type: String, required: false },
      slug: { type: String, required: false },
      metaDescription: { type: String, required: false },
    },

    translations: {
      type: Map,
      of: {
        title: { type: String, required: true },
        content: { type: String, required: false },
        summary: { type: String, required: false },
        SEO: {
          metaTitle: { type: String, required: false },
          metaDescription: { type: String, required: false },
        },
      },
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model<IEvent>("Event", eventSchema);

export default Event;
