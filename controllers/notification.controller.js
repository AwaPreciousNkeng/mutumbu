import Notification from "../models/notification.model.js";

// helper to create a notification (used by other controllers)
export const sendNotification = async ({ userId, message, type = "system", url = "", fromUser = null, track = null }) => {
    try {
        const note = await Notification.create({ user: userId, message, type, url, fromUser, track });
        return note;
    } catch (err) {
        console.error("sendNotification error:", err);
        return null;
    }
};

export const getNotifications = async (req, res) => {
    try {
        const notes = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(200);
        res.json({ success: true, notifications: notes });
    } catch (err) {
        console.error("getNotifications:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (err) {
        console.error("markAsRead:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
        res.json({ success: true });
    } catch (err) {
        console.error("markAllAsRead:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
