import mongoose from "mongoose";
import Config from ".";
import logger from "./logger";

const connectDB = async () => {
  try {
    await mongoose.connect(Config.MONGO_URL!);
    logger.info("Database connected successfully 🚀🚀");
  } catch (error) {
    logger.error(`Failed to connect to database 😢😢: ${error}`);
  }
};

export default connectDB;
