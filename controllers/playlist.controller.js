import Playlist from "../models/playlist.model.js";
import {deleteCloudinaryFile} from "../utils/deleteCloudinaryFile.js";

export const updatePlaylistCover = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        if (!req.file) return res.status(400).json({success: false, message: "No file uploaded"});

        //delete old cover
        if (playlist.coverPublicId) {
            await deleteCloudinaryFile(playlist.coverPublicId, "image");
        }

        playlist.coverPicture = req.file.path;
        playlist.coverPublicId = req.file.filename;
        await playlist.save();

        res.json({ success: true, playlist });
    } catch (error) {
        console.error("Error updating playlist cover:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const createPlaylist = async (req, res) => {
    try {
        const { name, isPublic, description } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Name required" });

        const playlist = await Playlist.create({
            name,
            owner: req.user.id,
            coverPicture: req.file?.path || "",
            isPublic: !!isPublic,
            description: description || ""
        });

        res.status(201).json({ success: true, playlist });
    } catch (err) {
        console.error("createPlaylist:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const addTrackToPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            { $addToSet: { tracks: req.body.trackId }},
            { new: true }
        );
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found or forbidden" });
        res.json({ success: true, playlist });
    } catch (err) {
        console.error("addTrackToPlaylist:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const removeTrackFromPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            { $pull: { tracks: req.body.trackId }},
            { new: true }
        );
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found or forbidden" });
        res.json({ success: true, playlist });
    } catch (err) {
        console.error("removeTrackFromPlaylist:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id).populate("tracks");
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });
        // If private playlist and not owner, deny
        if (!playlist.isPublic && String(playlist.owner) !== String(req.user.id) && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden - You are not authorized to access this playlist" });
        }
        res.json({ success: true, playlist });
    } catch (err) {
        console.error("getPlaylist:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};