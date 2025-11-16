import History from "../models/history.model.js";

export const addToHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { trackId } = req.body;
        if (!trackId) return res.status(400).json({ success: false, message: "trackId required" });

        // If exists, update timestamp; else create
        const existing = await History.findOne({ user: userId, track: trackId });
        if (existing) {
            existing.playedAt = Date.now();
            await existing.save();
            return res.json({ success: true, updated: true, record: existing });
        } else {
            const record = await History.create({ user: userId, track: trackId });
            return res.json({ success: true, created: true, record });
        }
    } catch (err) {
        console.error("addToHistory:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUserHistory = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        const history = await History.find({ user: userId }).populate("track").sort({ playedAt: -1 }).limit(200);
        res.json({ success: true, history });
    } catch (err) {
        console.error("getUserHistory:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const clearHistory = async (req, res) => {
    try {
        await History.deleteMany({ user: req.user.id });
        res.json({ success: true, message: "History cleared" });
    } catch (err) {
        console.error("clearHistory:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
