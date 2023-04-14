const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Please provide an username"]
    },
    email:{
        type:String,
        required:[true,"Please provide an email"],
        unique:[true,"Email address already in use"]
    },
    password:{
        type:String,
        required:[true,"Please provide a password"],
        minlength:6,
    }
})

module.exports = mongoose.model('User',userSchema)