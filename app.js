const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

require('dotenv').config();

require("./middleware/passport.middleware");

const authRoute = require('./routes/authRoutes');
const postRoute = require('./routes/postRoutes');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());


app.set('view engine', 'ejs');

app.use("/", authRoute);
app.use("/posts", postRoute);



app.use((err, req, res, next) => {
    // console.error(err.stack);

     console.error("FULL ERROR:", err); 
    res.status(500).send('Something broke!');
});

module.exports = app;
