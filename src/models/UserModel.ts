import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  dob?: Date;
  gender?: "male" | "female";
  highSchool?: string;
  country?: string;
  countryCode?: string;
  password: string;
  role: "user" | "admin" | "ambassador";
  status: "active" | "deleted" | "inactive";
  forgetPasswordToken?: string;
  forgetPasswordTokenExpiry?: string;
  imageURL?: string;
  age?: number; // Calculated field, not stored in DB
  isPasswordCorrect: (rawPassword: string) => Promise<boolean>;
  totalScore?: number; // For leaderboard purposes
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: [true, "Email is required"], unique: true },
  dob: Date,
  country: String,
  countryCode: String,
  gender: { type: String, enum: ["male", "female"] },
  highSchool: String,
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin", "ambassador"],
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

userSchema.virtual("age").get(function (this: IUser) {
  if (!this.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
