const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user.model");
const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, {
            message: "Incorrect password or username",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (token, done) => {
      try {
        done(null, token.id);
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);
