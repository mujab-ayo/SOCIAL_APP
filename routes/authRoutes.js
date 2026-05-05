const authRoute = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const { validateSignup, validateLogin } = require("../validators/validate");
const validate = require("../middleware/validator.middleware");
const User = require("../models/user.model");

authRoute.get("/", (req, res) => {
  res.render("index");
});

authRoute.get("/signup", (req, res) => {
  res.render("signup");
});

authRoute.get("/login", (req, res) => {
  res.render("login");
});

authRoute.post("/signup", validateSignup, validate, async (req, res) => {
  console.log("BODY:", req.body); // 👈 see what's coming in
  console.log("ERRORS:", validationResult(req).array());
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
      password,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    
    res.redirect("/posts")
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

authRoute.post("/login", validateLogin, validate, async (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    try {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!user) {
        return res.status(400).json({ error: info.message });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        res.render("posts", { token });
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  })(req, res, next);
});

module.exports = authRoute;
