const postRoute = require("express").Router();
const Post = require("../models/post.model");
const User = require("../models/user.model");
const Like = require("../models/like.model");
const passport = require("passport");

postRoute.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    let authorIds = [];

    if (search.trim() !== "") {
      const author = await User.find({
        username: { $regex: search, $options: "i" },
      }).select("_id");

      authorIds = author.map((user) => user._id);
    }

    const filterSearch = search.trim()
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
            { author: { $in: authorIds } },
          ],
        }
      : {};

    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;
    const sortOrder = { [sortBy]: order };

    const filter = { state: "draft", ...filterSearch };

    const thePosts = await Post.find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .populate("author", "firstName lastName username profilePic");

    const totalPosts = await Post.countDocuments(filter);

    const totalPages = Math.ceil(totalPosts / limit);

    res.render("posts", {
      posts: thePosts,
      pagination: {
        totalPosts,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      search,
      sortBy,
      order: req.query.order || "desc",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

postRoute.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      console.log(req.user);
      const { title, tags, content } = req.body;
      const author = req.user;

      if (!content)
        return res.status(400).json({ error: "kindly input some content" });

      if (!title) return res.status(400).json({ error: "title required" });

      const newPost = await Post.create({
        title,
        tags,
        content,
        author,
      });

      res.status(201).json({ message: "post created successfully", newPost });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
);

postRoute.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const thePost = await Post.findById(id)
      .where({ state: "published" })
      .populate("author", "firstName lastName username profilePic");

    if (!thePost) return res.status(404).json({ error: "post not found" });

    res.status(200).json(thePost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

postRoute.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const id = req.params.id;

      const { title, tags, content } = req.body;

      const makePost = await Post.findById(id);

      if (!makePost) return res.status(404).json({ error: "post not found" });

      if (makePost.author.toString() !== req.user) {
        return res
          .status(403)
          .json({ error: "you are not authorized to edit this post" });
      }

      makePost.title = title || makePost.title;
      makePost.tags = tags || makePost.tags;
      makePost.content = content || makePost.content;

      await makePost.save();

      res.status(200).json({ message: "post updated successfully", makePost });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
);

postRoute.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const id = req.params.id;

      const thePost = await Post.findById(id);

      if (!thePost) return res.status(404).json({ error: "post not found" });

      if (thePost.author.toString() !== req.user) {
        return res
          .status(403)
          .json({ error: "you are not authorized to delete this post" });
      }

      await thePost.deleteOne();
      res.status(200).json({ message: "post deleted successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
);

postRoute.post(
  "/:id/like",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const id = req.params.id;

      const thePost = await Post.findById(id);

      if (!thePost) return res.status(404).json({ error: "post not found" });

      const likeAlreadyExists = await Like.findOne({
        user: req.user,
        post: id,
      });

      if (likeAlreadyExists) {
        return res
          .status(400)
          .json({ error: "you have already liked this post" });
      }

      const newLike = await Like.create({
        user: req.user,
        post: id,
      });

      thePost.like_count = await Like.countDocuments({
        post: id,
      });

      await thePost.save();

      res.status(201).json({
        message: "post liked successfully",
        like_count: thePost.like_count,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
);

postRoute.patch(
  "/:id/publish",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const id = req.params.id;

      const thePost = await Post.findById(id);

      if (!thePost) return res.status(404).json({ error: "post not found" });

      if (thePost.author.toString() !== req.user) {
        return res
          .status(403)
          .json({ error: "you are not authorized to publish this post" });
      }

      if (thePost.state === "published") {
        return res.status(400).json({ error: "post is already published" });
      }

      thePost.state = "published";
      await thePost.save();

      await thePost.populate(
        "author",
        "firstName lastName username profilePic",
      );

      console.log(thePost.author.toString(), req.user);
      res.status(200).json(thePost);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
);

postRoute.delete(
  "/:id/like",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const id = req.params.id;

      const thePost = await Post.findById(id);

      if (!thePost) return res.status(404).json({ error: "post not found" });

      const like = await Like.findOne({
        user: req.user,
        post: id,
      });

      if (!like) return res.status(404).json({ error: "post was not liked" });

      await like.deleteOne();

      thePost.like_count = await Like.countDocuments({
        post: id,
      });

      await thePost.save();

      res
        .status(200)
        .json({
          message: "post unliked successfully",
          like_count: thePost.like_count,
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = postRoute;
