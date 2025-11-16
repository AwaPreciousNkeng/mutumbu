import User from "../models/user.model.js";
import {deleteCloudinaryFile} from "../utils/deleteCloudinaryFile.js";

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password -refreshTokens");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (error) {
        console.error("get profile error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const update = {};
        const user = await User.findByIdAndUpdate(req.user.id, ...req.body, { new: true })
            .select("-password -refreshTokens");
        res.json({ success: true, user });
    } catch (error) {
        console.error("update profile error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const updateProfilePicture = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: "No file uploaded"});
        const user = await User.findById(req.user.id);

        // Removing the old profile image
        if (user.profilePicturePublicId) {
            await deleteCloudinaryFile(user.profilePicturePublicId, "image");
        }

        //update user
        user.profilePicture = file.path;
        user.profilePicturePublicId = req.file.filename;
        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        console.error("update profile picture error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};