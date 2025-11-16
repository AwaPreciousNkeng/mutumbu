import mongoose from "mongoose";

const historySchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Track",
        required: true
    },

    playedAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

// Improve performance
historySchema.index({ user: 1, playedAt: -1 });

// Prevent duplicate entries (controller will update instead of re-create)
historySchema.index({ user: 1, track: 1 });

const History = mongoose.model("History", historySchema);
export default History;
