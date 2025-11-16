import Track from "../models/track.model.js";
import Comment from "../models/comment.model.js";

export const addComment = async (req, res) => {
    try {
        const { trackId, text, parentComment } = req.body;
        if (!trackId || !text) return res.status(400).json({ success: false, message: "Missing fields" });

        const track = await Track.findById(trackId);
        if (!track) return res.status(404).json({ success: false, message: "Track not found" });

        const comment = await Comment.create({
            text,
            user: req.user.id,
            track: trackId,
            parentComment: parentComment || null
        });

        // optional: push comment reference into track.comments if you want
        track.comments.push(comment._id);
        await track.save();

        res.status(201).json({ success: true, comment });
    } catch (err) {
        console.error("addComment:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// delete comment (owner or admin)
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ success: false, message: "Not found" });
        if (String(comment.user) !== String(req.user.id) && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        // soft delete
        comment.isDeleted = true;
        await comment.save();

        res.json({ success: true, message: "Comment deleted" });
    } catch (err) {
        console.error("deleteComment:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// like/unlike comment
export const toggleLikeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ success: false, message: "Not found" });

        const exists = (comment.likes || []).some(id => String(id) === String(req.user.id));
        if (exists) {
            comment.likes.pull(req.user.id);
            await comment.save();
            return res.json({ success: true, liked: false });
        } else {
            comment.likes.push(req.user.id);
            await comment.save();
            return res.json({ success: true, liked: true });
        }
    } catch (err) {
        console.error("toggleLikeComment:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// get comments for track
export const getCommentsForTrack = async (req, res) => {
    try {
        const comments = await Comment.find({ track: req.params.id, isDeleted: false }).populate("user", "name profilePicture").sort({ createdAt: -1 });
        res.json({ success: true, comments });
    } catch (err) {
        console.error("getCommentsForTrack:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
