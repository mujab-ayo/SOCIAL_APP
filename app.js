const express = require('express');
const bodyParser = require('body-parser');


const connectToDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());



app.set('view engine', 'ejs');


app.set((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;
