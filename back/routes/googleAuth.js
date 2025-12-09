const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");


passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {    
                user = await User.create({
                    username: profile.displayName,
                    googleId: profile.id,
                    email: profile.emails[0].value,
                });
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        const token = jwt.sign(
        { 
            id: req.user._id, 
            username: req.user.username,
            role: req.user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
        );

        res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
    }
);

// Роут для выхода (для JWT токенов logout делается на клиенте, но роут нужен для совместимости)
router.get("/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
});

module.exports = router;