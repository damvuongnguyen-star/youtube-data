const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect('mongoose://127.0.0.1:27017/youtube_crawler_db')
        console.log('Database connected')
    }
    catch(error){
        console.log('error: Cannot connect')
        process.exit(1);
    }
};
module.exports = connectDb
