import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "user" | "admin";
  status: "active" | "deleted" | "inactive";
  forgetPasswordToken?: string;
  forgetPasswordTokenExpiry?: string;
  imageURL?: string;
  isPasswordCorrect: (rawPassword: string) => Promise<boolean>;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: [true, "Email is required"], unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  status: { type: String, enum: ["active", "deleted", "inactive"], default: "active" },
  forgetPasswordToken: String,
  forgetPasswordTokenExpiry: String,
  imageURL: String,
});

// Hash password before saving user to database
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error as Error);
  }
});

userSchema.pre("findOneAndUpdate", async function (next) {
  // console.log("Update user password.....");
  const update = this.getUpdate() as mongoose.UpdateQuery<IUser>;

  if (update?.password) {
    // console.log("Update user password.....", update.password);
    update.password = await bcrypt.hash(update.password, 10);
    this.setUpdate(update);
  }

  next();
});

userSchema.methods.isPasswordCorrect = async function (rawPassword: string) {
  // console.log(rawPassword, this);
  if (!this.password) return false;
  return await bcrypt.compare(rawPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
