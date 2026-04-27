require('dotenv').config();

const mongoose = require('mongoose');

const connectToDB = async () => {
mongoose.connect(process.env.MONGO_URI)

    mongoose.mongoose.connection.on('connected', () => {
        console.log('Connected to MongoDB');
    });

    mongoose.mongoose.connection.on('error', (err) => {
        console.error('Error connecting to MongoDB:', err);
    });
}

module.exports = connectToDB;