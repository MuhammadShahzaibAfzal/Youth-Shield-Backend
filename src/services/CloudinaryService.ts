import { v2 as cloudinary } from "cloudinary";
import createHttpError from "http-errors";
import Config from "../config";
import { FileData, FileStorage } from "../types/storage";

class CloudinaryStorageService implements FileStorage {
  constructor() {
    cloudinary.config({
      cloud_name: Config.CLOUDINARY_CLOUD_NAME,
      api_key: Config.CLOUDINARY_API_KEY,
      api_secret: Config.CLOUDINARY_API_SECRET,
    });
  }

  async upload(data: FileData): Promise<string> {
    try {
      const base64FileData = `data:${data.contentType};base64,${Buffer.from(
        data.fileData
      ).toString("base64")}`;

      const result = await cloudinary.uploader.upload(base64FileData, {
        resource_type: "auto",
        public_id: data.fileName,
        folder: "uploads",
        timeout: 180000,
      });

      console.log("Cloudinary Result: ", result.url);
      return result.secure_url;
    } catch (error) {
      console.log(error);
      const err = createHttpError(400, "Failed to upload image to Cloudinary");
      throw err;
    }
  }

  async delete(fileName: string): Promise<void> {
    try {
      const publicId = `uploads/${fileName}`;
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.log(error);
      const err = createHttpError(400, "Failed to delete image from Cloudinary");
      throw err;
    }
  }
}

export default CloudinaryStorageService;
