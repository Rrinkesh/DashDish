const mongoose = require('mongoose');

const connectdb = async () => {
    const mongoURI = process.env.MONGO_URI || process.env.MONGO || 'mongodb://127.0.0.1:27017/food_del';

    mongoose.set('bufferCommands', false);

    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
            connectTimeoutMS: 5000
        });
        console.log('db connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
    }
};

module.exports = { connectdb };

