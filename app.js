const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");

require("dotenv").config();

require("./middleware/passport.middleware");

const authRoute = require("./routes/authRoutes");
const postRoute = require("./routes/postRoutes");
const userRoute = require("./routes/userRoutes");
const feedRoute = require("./routes/feedRoutes");

const Post = require("./models/post.model");
const User = require("./models/user.model");


const app = express();

app.use(express.static("public"));
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

app.use("/", authRoute);
app.use("/posts", passport.authenticate("jwt", { session: false }), postRoute);
app.use("/user", passport.authenticate("jwt", { session: false }), userRoute);
app.use("/feed", passport.authenticate("jwt", { session: false }), feedRoute);

app.get("/view/posts",  async (req, res) => {
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

    const filter = { state: "published", ...filterSearch };

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

app.get("/view/post/:id", async (req, res) => {

  try {
      const id = req.params.id;
  
      const thePost = await Post.findById(id)
        .where({ state: "published" })
        .populate("author", "firstName lastName username profilePic");
  
      if (!thePost) return res.status(404).json({ error: "post not found" });
  
      res.render("post", { thePost });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }

});

app.use((err, req, res, next) => {
  // console.error(err.stack);

  console.error("FULL ERROR:", err);
  res.status(500).send("Something broke!");
});

module.exports = app;
