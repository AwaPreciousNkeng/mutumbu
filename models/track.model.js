import mongoose from "mongoose";

const trackSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    audioUrl: {
        type: String,
        required: true
    },

    audioPublicId: {
        type: String,   // used for deletion in Cloudinary
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

    duration: Number, // seconds

    genres: [String], // array allows multiple genres

    description: {
        type: String,
        default: ""
    },

    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
        default: null
    },

    streams: {
        type: Number,
        default: 0
    },

    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],

    downloadable: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// Indexes for search performance
trackSchema.index({ title: "text" });
trackSchema.index({ genres: 1 });

const Track = mongoose.model("Track", trackSchema);
export default Track;
