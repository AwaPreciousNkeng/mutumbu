import cloudinary from "cloudinaryConfig.js"

export const deleteCloudinaryFile = async (publicId, resource = "image") => {
    try {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId, { resource_type: resource });
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
    }
}