require('dotenv').config();
const mongoose = require('mongoose');

const mongURL = process.env.DB_URL;

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        });
        console.log("Connected to your MongoDB Database Successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

module.exports = connectToMongo;
