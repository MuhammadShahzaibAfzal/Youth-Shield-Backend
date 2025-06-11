import Config from "./config";
import app from "./app";
import logger from "./config/logger";
import connectDB from "./config/db";

const startServer = async () => {
  try {
    await connectDB();
    app.listen(Config.PORT, () => {
      logger.info(`Server running on port ${Config.PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

startServer();
