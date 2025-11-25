const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const db = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
      if (err) {
        return done(err);
      }
      return done(null, user);
    });
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        const googleId = profile.id;
        const username = profile.displayName;

        db.get("SELECT * FROM users WHERE googleId = ?", [googleId], (err, user) => {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, user);
          } else {
            db.run(
              "INSERT INTO users (username, googleId) VALUES (?, ?)",
              [username, googleId],
              function (err) {
                if (err) {
                  return done(err);
                }
                db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, newUser) => {
                  if (err) {
                    return done(err);
                  }
                  return done(null, newUser);
                });
              },
            );
          }
        });
      },
    ),
  );
};
