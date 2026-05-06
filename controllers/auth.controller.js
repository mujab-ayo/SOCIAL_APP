const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../models/user.model");

const signup = async function (req, res) {
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

    res.status(201).json({
      newUser: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res, next) => {
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
        
        res.status(200).json({
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
          },
          token,
        });
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  })(req, res, next);
};

module.exports = {
  signup,
  login,
};
