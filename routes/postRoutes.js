const postRoute = require("express").Router();

const postController = require("../controllers/post.controller");

postRoute.post("/create", postController.createPost);

postRoute.put("/:id", postController.editPost);

postRoute.delete("/:id", postController.deletePost);

postRoute.post("/:id/like", postController.likePost);

postRoute.patch("/:id/publish", postController.publishPost);

postRoute.delete("/:id/like", postController.unlikePost);

module.exports = postRoute;
