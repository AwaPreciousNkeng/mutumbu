import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from "cloudinaryConfig.js";

export const createStorage = (folderName, resourceType = "image") => {
    return new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `mutumbu/${folderName}`,
            resource_type: resourceType,
            allowedFormats: resourceType === "video"
                ? ["mp3", "wav", "aac", "flac", "oog"]
                : ["jpg", "png", "webp", "jpeg"],
            transformation: resourceType === "image"
            ? [{width: 800, height: 800, crop: "limit"}]
                : []
        }
        }
    );
};
