const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongoDbUrl);
        console.log("Connected to MongoDB");
    } catch(error) {
        console.log("error in connected to db: ", error);
    }
}

module.exports = {
    connectDB
}