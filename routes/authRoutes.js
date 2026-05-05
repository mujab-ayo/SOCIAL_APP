const authRoute = require("express").Router();

const authController = require("../controllers/auth.controller");
const { validateSignup, validateLogin } = require("../validators/validate");
const validate = require("../middleware/validator.middleware");

authRoute.get("/", (req, res) => {
  res.render("index");
});

authRoute.get("/signup", (req, res) => {
  res.render("signup");
});

authRoute.get("/login", (req, res) => {
  res.render("login");
});

authRoute.post("/signup", validateSignup, validate, authController.signup);

authRoute.post("/login", validateLogin, validate, authController.login);

module.exports = authRoute;
