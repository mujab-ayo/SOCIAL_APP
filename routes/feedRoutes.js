const feedRoute = require("express").Router();
const passport = require("passport");

const Post = require("../models/post.model");
const Follow = require("../models/follow.model");

feedRoute.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const userId = req.user;
  const userFollowing = await Follow.find({ following: userId });

  const userFollowingId = userFollowing.map((id) => id.follower);

  const userFollowed = await Follow.find({ follower: userId });

  const userFollowedId = await userFollowed.map((id) => id.following);

  const postAuthorId = [...userFollowedId, ...userFollowingId, userId];

  const feedPost = await Post.find({
    author: { $in: postAuthorId },
    state: "published",
  })
    .populate("author", "firstName lastName username profilePic")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPosts = await Post.countDocuments({
    author: { $in: postAuthorId },
    state: "published",
  });

  const totalPages = Math.ceil(totalPosts / limit);

  res.json({
    posts: feedPost,
    totalPosts,
    totalPages,
    currentPage: page,
  });
});

module.exports = feedRoute;
