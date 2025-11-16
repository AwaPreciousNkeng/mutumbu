import Track from "../models/track.model.js";
import Album from "../models/album.model.js";
import {deleteCloudinaryFile} from "../utils/deleteCloudinaryFile.js";


export const getTracksByArtist = async (req, res) => {
    try {
        const artistId = req.params.id
        const tracks = await Track.find({ artist: artistId }).sort({ createdAt: -1 });
        res.json({ success: true, tracks });
    } catch (error) {
        console.error("get artist tracks error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

export const uploadTrack = async (req, res) => {
    try {
        const audioFile = req.files?.audio?.[0];
        const coverFile = req.files?.cover?.[0];

        if (!audioFile ) return res.status(400).json({ success: false, message: "No audio file uploaded" });

        const track = await Track.create({
            title: req.body.title,
            artist: req.user.id,
            audioUrl: audioFile.path,
            audioPublicId: audioFile.filename,
            coverPicture: coverFile?.path || "",
            coverPublicId: coverFile?.filename || ""
        });

        res.json({ success: true, track });
    } catch (error) {
        console.error("Error uploading track:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const updateTrack = async (req, res) => {
    try {
        const track = await Track.findById(req.params.id);
        if (!track) return res.status(404).json({ success: false, message: "Track not found" });

        const audioFile = req.files?.audio?.[0];
        const coverFile = req.files?.cover?.[0];

        if (audioFile) {
            await deleteCloudinaryFile(track.audioPublicId, "video");
            track.audioUrl = audioFile.path;
            track.audioPublicId = audioFile.filename;
        }

        if (coverFile) {
            await deleteCloudinaryFile(track.coverPublicId, "image")
            track.coverPicture = coverFile.path;
            track.coverPublicId = coverFile.filename;
        }

        if (req.body.title) track.title = req.body.title;
        await track.save();
        res.json({ success: true, track });
    } catch (error) {
        console.error("Error updating track:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const deleteTrack = async (req, res) =>  {
    try {
        const track = await Track.findById(req.params.id);
        if (!track) return res.status(404).json({ success: false, message: "Track not found" });

        if (String(track.artist) !== String(req.user.id) && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden - You are not authorized to delete this track" });
        }

        //remove from the album
        await Album.updateMany({ tracks: track._id }, { $pull: { tracks: track._id}});
        await Track.findByIdAndDelete(track._id);

        //delete it from cloudinary
        await deleteCloudinaryFile(track.audioPublicId, "video");
        res.json({ success: true, message: "Track deleted successfully" });
    } catch (error) {
        console.error("Error deleting track:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

export const incrementStream = async (req, res) => {
    try {
        const track = await Track.findByIdAndUpdate(req.params.id, { $inc: { streams: 1 }}, { new: true });
        res.json({ success: true, streams: track.streams });
    } catch (error) {
        console.error("Error incrementing stream:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

export const toggleLike = async (req, res) => {
    try {
        const trackId = req.params.id;
        const userId = req.user.id;
        const track = await Track.findById(trackId);
        if (!track) return res.status(404).json({ success: false, message: "Track not found" });

        const already = track.likes.some(id => String(id) === String(userId));
        if (already) {
            track.likes.pull(userId);
            await track.save();
            return res.json({ success: true, liked: false });
        } else {
            track.likes.push(userId);
            await track.save();
            return res.json({ success: true, liked: true });
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const searchTracks = async (req, res) => {
    try {
        const q = req.query.q || "";
        const regex = new RegExp(q, "i");
        const tracks = await Track.find({ title: regex })
        res.json({ success: true, tracks });
    } catch (error) {
        console.error("Error searching tracks:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}
