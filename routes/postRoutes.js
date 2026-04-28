const postRoute = require("express").Router();
const Post = require("../models/post.model");
const passport = require('passport');






postRoute.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const filterSearch = search.trim() ? {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ],
    }
      : {};
    
    
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.sortOrder === "asc" ? 1 : -1;
    const sortOrder = { [sortBy]: order };
    
    const filter = { status: "published", ...filterSearch };

    const thePosts = await Post.find(filter).sort(sortOrder).skip(skip).limit(limit).populate("author", "firstName lastName username profilePic");

    const totalPosts = await Post.countDocuments(filter);
    
    const totalPages = Math.ceil(totalPosts / limit);


    res.json({
      posts: thePosts,
      totalPosts,
      totalPages,
      currentPage: page,
    });


  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

postRoute.post("/create",passport.authenticate("jwt", { session: false }), async (req, res) => {
    try {
      
        console.log(req.user)
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
      console.log(err)
    res.status(500).json({ error: err.message });
  }
});

module.exports = postRoute;
