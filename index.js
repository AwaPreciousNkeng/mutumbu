import express from 'express';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import {connectDB} from "./config/db.js";
import authRoute from "./routes/auth.route.js";
dotenv.config();


const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize())
app.use("/auth/", authRoute)

app.listen(port, () => {
    connectDB()
    console.log(`Server is running on port ${port}`)
});

