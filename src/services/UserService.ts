import User, { IUser } from "../models/UserModel";

class UserService {
  async findUserByEmail(email: string) {
    return await User.findOne({ email }, " -__v").populate("highSchool");
  }

  async findUserById(id: string, isPasswordIncluded: boolean = false) {
    const projection = isPasswordIncluded ? "" : "-password";
    return await User.findById(id).select(projection).populate("highSchool");
  }

  async createUser(data: Partial<IUser>) {
    return (await User.create(data)).populate("highSchool");
  }

  async update(id: string, data: Partial<IUser>) {
    // Check if the data contains a password field and if it's empty
    if (data.password && data.password.trim() === "") {
      // Remove the password field from the data object
      const { password, ...rest } = data;
      data = rest;
    }

    // Perform the update operation
    return await User.findOneAndUpdate({ _id: id }, data, { new: true }).populate(
      "highSchool"
    );
  }

  async delete(id: string) {
    return await User.findByIdAndDelete(id);
  }

  async getAll() {
    return await User.find({}).select("-password -__v").populate("highSchool");
  }

  async getAllUsers() {
    return await User.find({
      role: "user",
    })
      .select("-password -__v")
      .populate("highSchool");
  }
}

export default UserService;
