const mongoose = require('mongoose');

module.exports = async() => {
    try {
        await mongoose.connect('mongodb+srv://dimitricoppet:Hackathon@cluster0.qzd4bho.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.log('Error connecting to the database:', error);
    }
}