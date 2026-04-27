const { body } = require("express-validator");

exports.validateSignup = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("username")
    .toLowerCase()
    .notEmpty()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters long"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

exports.validateLogin = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];
