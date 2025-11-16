import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    message: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["follow", "like", "comment", "track", "system", "concert", "album"],
        default: "system"
    },

    url: {
        type: String,
        default: ""
    },

    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Track",
        default: null
    },

    read: {
        type: Boolean,
        default: false
    },

    batchId: {
        type: String,
        default: null
    }

}, { timestamps: true });

// Fast queries
notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
