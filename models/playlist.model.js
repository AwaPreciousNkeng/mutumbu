import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    saves: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    coverPicture: {
        type: String,
        default: ""
    },
    tracks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Track"
        }
    ],
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Playlist = mongoose.model("Playlist", playlistSchema);
export default Playlist;