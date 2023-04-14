const mongoose = require('mongoose')

const connectDB = async (url) => {
    try{
        await mongoose.connect(url)
    }catch(e){
        console.log(e);
    }
}

module.exports = connectDB