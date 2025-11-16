import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        minLength: 6,
        required: function () {
            return !this.oauthProvider;
        }
    },

    oauthProvider: String,
    oauthId: String,

    refreshTokens: [String],

    profilePicture: {
        type: String,
        default: ""
    },
    profilePicturePublicId: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["user", "admin", "artist"],
        default: "user"
    },

    bio: {
        type: String,
        default: ""
    },

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    genres: [String],

    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Performance indexes
userSchema.index({ email: 1 });
userSchema.index({ oauthProvider: 1, oauthId: 1 });

const User = mongoose.model("User", userSchema);
export default User;
