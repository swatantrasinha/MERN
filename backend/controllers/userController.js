import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc  Auth user/set token
// route  POST /api/users/auth
// @access Public
const authUser= asyncHandler(async (req, res) => {
    const { email, password}= req.body;
    const user= await User.findOne({email}); 
    if(user && (await user.matchPassword(password))) {
        generateToken(res, user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email
        })
    } else {
        res.status(400);
        throw new Error('Invalid  email or password ')
    }

    // res.status(200).json({message: 'Auth user'})
});


// @desc  register a new user
// route  POST /api/users
// @access Public
const registerUser= asyncHandler(async (req, res) => {
    console.log('in regitration process');
    
    const {name, email, password}= req.body;
    const userExists= await User.findOne({email});
    if(userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user= await User.create({name, email, password});
    if(user) {
        generateToken(res, user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email
        })
    } else {
        res.status(400);
        throw new Error('Invalid  User Data')
    }
});

// @desc  logout user
// route  POST /api/logout
// @access Public
const logoutUser= asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0), // expires right now
    })
    res.status(200).json({message: 'User Logged Out'})
});


// @desc  get user profile
// route  GET /api/users/profile
// @access Private
const getUserProfile= asyncHandler(async (req, res) => {
    // To display data from req object
    const userData= {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email
    }
    res.status(200).json({userData: userData})
    
    // To take userId from req.user and fetch data data from database and display it
    /*
    const user= await User.findById(req.user._id);
    res.status(200).json({user})
    */
});

// @desc  update user profile
// route  PUT /api/users/profile
// @access Private
const updateUserProfile= asyncHandler(async (req, res) => {
    const user= await User.findById(req.user._id);
    if(user) {
        user.name= req.body.name || user.name; // if in req body- req.body.name is not there then updation is not needed
        user.email= req.body.email || user.email; // if in req body- req.body.email is not there then updation is not needed

        if(req.body.password) {
            user.password= req.body.password;
        }
        const updatedUser= await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email
        })
    } else {
        res.status(404);
        throw new Error('User Not Found')
    }
    // res.status(200).json({message: 'Update User Profile'})
});


export {authUser, registerUser, logoutUser, getUserProfile, updateUserProfile};