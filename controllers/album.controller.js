import Album from "../models/album.model.js";
import Track from "../models/track.model.js";

export const createAlbum = async ( req, res ) => {
    try {
        const { title, releaseDate, albumType, genres, description } = req.body;
        if (!title) return res.status(400).json({ success: false, message: "Title is required" });

        const album = await Album.create({
            title,
            artist: req.user.id,
            coverPicture: req.file?.path || "",
            coverPublicId: req.file?.filename || "",
            releaseDate: releaseDate ? new Date(releaseDate) : Date.now(),
            albumType: albumType || "album",
            genres: genres ? (Array.isArray(genres) ? genres : genres.split(",")) : [],
            description: description || ""
        });

        res.status(201).json({ success: true, album });
    } catch (error) {
        console.error("Error creating album:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const addTrackToAlbum = async (req, res) => {
    try {
       const { albumId } = req.params;
       const { trackId } = req.body;
       const album = await Album.findOne({ _id: albumId, artist: req.user.id });
       if (!album) return res.status(404).json({ success: false, message: "Album not found or you are not the artist" });

       album.tracks.push(trackId);
       await album.save();

       //recompute the total duration of the album
        const total = await Track.aggregate([{ $match: { _id: { $in: album.tracks } } }, { $group: { _id: null, total: { $sum: "$duration" } }}])
        album.totalDuration = (total[0] && total[0].sum) || 0;
        await album.save();

       res.json({ success: true, message: "Track added to album successfully", album });
    } catch (error) {
        console.error("Error adding track to album:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

export const removeTrackFromAlbum = async (req, res) => {
    try {
        const { albumId, trackId } = req.params;
        const album = await Album.findOneAndUpdate({ _id: albumId, artist: req.user.id }, { $pull: { tracks: trackId }}, { new: true });
        if (!album) return res.status(404).json({ success: false, message: "Album not found or forbidden" });
        res.json({ success: true, album });
    } catch (err) {
        console.error("removeTrackFromAlbum:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAlbum = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id).populate("tracks");
        if (!album) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, album });
    } catch (err) {
        console.error("getAlbum:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const listArtistAlbums = async (req, res) => {
    try {
        const id = req.params.id || req.user.id;
        const albums = await Album.find({ artist: id }).sort({ createdAt: -1 });
        res.json({ success: true, albums });
    } catch (err) {
        console.error("listArtistAlbums:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateAlbumCover = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) return res.status(404).json({ success: false, message: "Album not found" });

        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

        //delete the old image
        if (album.coverPublicId) {
            await deleteCloudinaryFile(album.coverPublicId, "image");
        }

        album.coverPicture = req.file.path;
        album.coverPublicId = req.file.filename;
        await album.save();

        res.json({ success: true, album });
    } catch (error) {
        console.error("Error updating album cover:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};