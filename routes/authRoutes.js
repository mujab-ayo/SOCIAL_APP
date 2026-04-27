const authRoute = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');



const { validateSignup, validateLogin } = require('../validators/validate');
const { validate } = require('../middleware/validator.middleware');
const User = require('../models/User.model');

authRoute.post("signup", validateSignup, validate, async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;

        const userExist = await User.findOne({ email });
        
        if (userExist) {
            return res.status(400).json({ error: "User already exists" });
        }

        const usernameTaken = await User.findOne({ username });

        if (usernameTaken) {
            return res.status(400).json({ error: "Username already taken" });
        }


       const newUser = await User.create({
            firstName,
            lastName,
            username,
            email,
            password
        });

const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: "User created successfully", token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

authRoute.post("/login", validateLogin, validate, async (req, res, next) => {

    passport.authenticate("login", { session: false }, (err, user, info) => {

       try{ if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(400).json({ error: info.message });
        }

        req.login(user, { session: false }, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            return res.json({ message: "Login successful", token });
        });
       } catch (err) {
        return res.status(500).json({ error: err.message });
       }
        
    })(req, res, next);
    


})

module.exports = authRoute;