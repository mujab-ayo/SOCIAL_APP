const Post = require("../models/post.model");
const Follow = require("../models/follow.model");
const User = require("../models/user.model");

const myPost = async function (req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { author: req.user };

    if (req.query.state) {
      if (!["draft", "published"].includes(req.query.state)) {
        return res.status(400).json({ error: "Invalid state value" });
      }
      filter.state = req.query.state;
    }

    const myPosts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments(filter);

    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts: myPosts,
      totalPosts,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const getFollowing = async (req, res) => {
  try {
    const followingRecord = await Follow.find({ follower: req.user }).populate(
      "following",
      "username bio profilePic",
    );
    res.json({
      count: followingRecord.length,
      followingList: followingRecord.map((record) => record.following),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const getFollowers = async (req, res) => {
  try {
    const followersRecord = await Follow.find({ following: req.user }).populate(
      "follower",
      "username bio profilePic",
    );

    res.json({
      count: followersRecord.length,
      followersList: followersRecord.map((record) => record.follower),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// const followUser = async (req, res) => {

//      try {
//         const toFollowId = req.params.id;
//        const userId = req.user;

//        console.log(req.params);
//        console.log(req.user);

//         if (toFollowId === userId) {
//           return res.status(400).json({ error: "You cannot follow yourself" });
//         }

//         const toFollowUser = await User.findById(toFollowId);

//         if (!toFollowUser) {
//           return res.status(404).json({ error: "User to follow not found" });
//         }

//         const alreadyFollowing = await Follow.findOne({
//           follower: userId,
//           following: toFollowId,
//         });

//         if (alreadyFollowing) {
//           return res
//             .status(400)
//             .json({ error: "You are already following this user" });
//         }

//         const newFollow = new Follow({
//           follower: userId,
//           following: toFollowId,
//         });

//         await newFollow.save();

//         res.json({ message: `Successfully followed ${toFollowUser.username}` });
//       } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: err.message });
//       }

// }

const followUser = async (req, res) => {
  try {
    const toFollowId = req.params.id;
    const userId = req.user;

    if (!toFollowId) {
      return res.status(400).json({ error: "User id is required" });
    }

    if (toFollowId === userId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const toFollowUser = await User.findById(toFollowId);
    console.log(toFollowUser)

    if (!toFollowUser) {
      return res.status(404).json({ error: "User to follow not found" });
    }

    const alreadyFollowing = await Follow.findOne({
      follower: userId,
      following: toFollowId,
    });

    console.log(alreadyFollowing)

    if (alreadyFollowing) {
      return res
        .status(400)
        .json({ error: "You are already following this user" });
    }

    const newFollow = new Follow({
      follower: userId,
      following: toFollowId,
    });

    await newFollow.save();

    res.json({
      message: `Successfully followed ${toFollowUser.username}`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const toUnfollowId = req.params.id;
    const userId = req.user;

    if (toUnfollowId === userId) {
      return res.status(400).json({ error: "You cannot unfollow yourself" });
    }

    const toUnfollowUser = await User.findById(toUnfollowId);

    const followRecord = await Follow.findOne({
      follower: userId,
      following: toUnfollowId,
    });

    if (!followRecord) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    await Follow.deleteOne({ _id: followRecord._id });

    res.json({
      message: `Successfully unfollowed ${toUnfollowUser.username}`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  myPost,
  getFollowing,
  getFollowers,
  followUser,
  unfollowUser,
};
