# Setup with MongoDB and JWT
----------------------------

MongoDB setup is already done in branch **backend-setup-with-mongodb**
here we will do setup for JWT authentication

## Generate token and store in cookie  
1. JWT_SECRET in .env file  

Add a varibale wuth name JWT_SECRET in .env file and give a value to it

> JWT_SECRET=abc123

 
2. Create a new folder utils inside backend folder  
and add a new file generateToken.js

generateToken.js
----------------

```javascript
import jwt from 'jsonwebtoken'

const generateToken= (res, userId) => {
    const token= jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
    res.cookie('jwt', token,{
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
    })
}
export default generateToken;
```
