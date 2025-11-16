import Favorite from "../models/favorite.model.js";
import Track from "../models/track.model.js";

// add favorite (toggle)
export const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { trackId } = req.body;
        if (!trackId) return res.status(400).json({ success: false, message: "trackId required" });

        const existing = await Favorite.findOne({ user: userId, track: trackId });
        if (existing) {
            await existing.remove();
            // optionally decrement counter on track
            await Track.findByIdAndUpdate(trackId, { $pull: { likes: userId }});
            return res.json({ success: true, favorited: false });
        } else {
            await Favorite.create({ user: userId, track: trackId });
            // optionally increment
            await Track.findByIdAndUpdate(trackId, { $addToSet: { likes: userId }});
            return res.json({ success: true, favorited: true });
        }
    } catch (err) {
        console.error("toggleFavorite:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getFavorites = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        const favorites = await Favorite.find({ user: userId }).populate("track");
        res.json({ success: true, favorites });
    } catch (err) {
        console.error("getFavorites:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
