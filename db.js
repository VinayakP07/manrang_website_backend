require('dotenv').config();
const mongoose = require('mongoose');
const mongURL = process.env.DB_URL;
const connectToMongo = async() => {
    await mongoose.connect(mongURL);
    console.log("Connected to your MongoDB Database Successfully");
}

module.exports = connectToMongo;