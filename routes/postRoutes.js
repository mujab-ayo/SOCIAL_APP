const postRoute = require('express').Router();

postRoute.get("/", (req, res) => {
    res.send("Posts route");
});

module.exports = postRoute;