import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    coverPicture: {
        type: String,
        default: ""
    },

    coverPublicId: {
        type: String,
        default: ""
    },
    albumType: {
        type: String,
        enum: ["single", "ep", "album"],
        default: "album"
    },
    genres: [String],
    totalDuration: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ""
    },
    releaseDate: {
        type: Date,
        default: Date.now
    },
    tracks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Track"
        }
    ],
}, {
    timestamps: true
})
const Album = mongoose.model("Album", albumSchema);
export default Album;
