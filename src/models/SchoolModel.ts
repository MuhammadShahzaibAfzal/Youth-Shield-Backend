import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISchool extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const schoolSchema: Schema<ISchool> = new Schema(
  {
    name: {
      type: String,
      required: [true, "School name is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return v.length >= 2 && v.length <= 100;
        },
        message: "School name must be between 2 and 100 characters",
      },
    },
  },
  {
    timestamps: true,
    collation: { locale: "en", strength: 2 },
  }
);

schoolSchema.index({ name: 1 }, { unique: true });

const School: Model<ISchool> = mongoose.model<ISchool>("School", schoolSchema);

export default School;
