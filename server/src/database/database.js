const mongoose = require('mongoose');

module.exports = async() => {
    try {
        await mongoose.connect('mongodb://localhost:27017/hackathon_quiz');
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.log('Error connecting to the database:', error);
    }
}