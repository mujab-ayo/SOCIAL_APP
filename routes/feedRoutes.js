const feedRoute = require("express").Router();

const feedController = require("../controllers/feed.constroller");

feedRoute.get("/", feedController.feed);

module.exports = feedRoute;
