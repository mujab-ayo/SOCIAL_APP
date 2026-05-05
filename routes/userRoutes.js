const userRoute = require("express").Router();

const userController = require("../controllers/user.controller");

userRoute.get("/me/posts", userController.myPost);

userRoute.get("/me/following", userController.getFollowing);

userRoute.get("/me/followers", userController.getFollowers);

userRoute.post("/:id/follow", userController.followUser);

userRoute.delete("/:id/unfollow", userController.unfollowUser);

module.exports = userRoute;
