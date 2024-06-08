import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js'

const protect=  asyncHandler(async (req,res,next) => {
    let token=null;
    token= req.cookies.jwt; // possible because of cookie parser
    
    if(token) {
        console.log('token present: continue');
        try {
            const decoded= jwt.verify(token, process.env.JWT_SECRET); // 2 paraem - actual token and secret key
            console.log("protect function ==> decoded : ", decoded);
            
/*  Note:   
        In generateToken.js we have passed userId in token
        const token= jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: '30d'}); 
        
        The decoded object should have userId in it. The ultimate goal is to set req.user to user of token
        as req.user can access from any route so set req.user to user of the token   
        
        User.findById(decoded.userId) - this will have user but will also have password even though its hashed
        So we will still remove that
        */
        req.user= await User.findById(decoded.userId).select('-password');

  
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, invalid token')
        }
    } else {
        console.log('token absent !!! ');
        res.status(401);
        throw new Error('Not authorized, no token')
    }
});

export {protect} ;