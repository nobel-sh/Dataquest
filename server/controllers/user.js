const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userLogin = asyncHandler( async (req,res)=>{

        console.log(req.body);
        const {email,password} = req.body;
        
        if(!email || !password){
            res.status(400);
            throw new Error("Input Field Missing.");
        }


        const ifUserExists = await User.exists({email});
        if(!ifUserExists){
            res.status(404);
            throw new Error("User Not Found");
        }
        const user = await User.findOne({email})

        const isPasswordValid = await bcrypt.compare(password,user.password)

        if (user && isPasswordValid){
            const accessToken = jwt.sign({
                user: {
                    username: user.username,
                    email: user.email,
                    id: user.id,
                    }
                },
                process.env.JWT_TOKEN,
                {expiresIn:"240"},
            )
            const {username,_id:user_id} = user;
            res.status(200).json({accessToken,expiresIn:'10000',user:{username,user_id}});
        }else {
            res.status(401);
            throw new Error("Invalid Password")
        }

    }
)

const userRegister = asyncHandler( async (req,res)=>{
    console.log(req.body);
    const {username,email,password} = req.body;
        
        if(!username || !email || !password){
            res.status(400);
            throw new Error("Input Field Missing.");
        }

    const ifUserExists = await User.exists({email});
    if(ifUserExists){
        res.status(400);
        throw new Error("User already exists");
    }

    const hashedPass = await bcrypt.hash(password,10);

    const users = await User.create({
        username,
        email,
        password:hashedPass,
    });
    
    if(!users){
        res.status(400);
        throw new Error("Could not register user");
    }
    
    res.status(200).json({});

    }
)

const getActiveUser = asyncHandler( async (req,res)=>{
    res.status(200).json(req.user);
    }
)


module.exports = {
    userLogin,
    userRegister,
    getActiveUser
}