import passport from "passport";
import GoogleStrategy from "passport-google-oauth20"

import dotenv from "dotenv";
import User from "../models/user.model";
dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            let user = await User.findOne({
                oauthProvider: "google",
                oauthId: profile.id
            });
            if (!user) {
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    oauthProvider: "google",
                    oauthId: profile.id,
                    role: "user"
                });
            }
            return done(null, user);
        }
    )
);

export default passport;