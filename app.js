const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");

require("dotenv").config();

require("./middleware/passport.middleware");

const postController = require("./controllers/post.controller");

const authRoute = require("./routes/authRoutes");
const postRoute = require("./routes/postRoutes");
const userRoute = require("./routes/userRoutes");
const feedRoute = require("./routes/feedRoutes");




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

app.get("/view/posts", postController.getAllPosts);

app.get("/view/post/:id", postController.getPostById);

// app.use("*", (req, res) => {
//   res.status(404).send("Page not found");
// });

app.use((err, req, res, next) => {
  

  console.error("FULL ERROR:", err);
  res.status(500).send("Something broke!");
});

module.exports = app;
