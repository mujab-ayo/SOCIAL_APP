const authRoute = require("express").Router();

const authController = require("../controllers/auth.controller");
const { validateSignup, validateLogin } = require("../validators/validate");
const validate = require("../middleware/validator.middleware");

authRoute.get("/", (req, res) => {
  res.render("index");
});


authRoute.post("/signup", validateSignup, validate, authController.signup);

authRoute.post("/login", validateLogin, validate, authController.login);


module.exports = authRoute;
