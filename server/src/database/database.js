const mongoose = require('mongoose');

module.exports = async() => {
    try {
        await mongoose.connect('mongodb+srv://ichemdghim:TWfy1ed4qVoFR2ht@whitelabel.f7u4zhu.mongodb.net/?retryWrites=true&w=majority&appName=WhiteLabel');
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.log('Error connecting to the database:', error);
    }
}