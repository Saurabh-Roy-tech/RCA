const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rca_db', {
            serverSelectionTimeoutMS: 5000 // Fail fast if no local mongo
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        isConnected = true;
    } catch (err) {
        console.error(`MongoDB Connection Error: ${err.message}`);
        console.log('Falling back to local file storage mode.');
        isConnected = false;
        // Do not exit process, allow fallback
    }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };