const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User.model');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;


passport.use(new LocalStrategy("login", {
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {

    try {

        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }   

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
    
}));