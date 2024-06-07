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
    res.cookie('jwt', token,{  // store in cookie
        httpOnly: true, // 
        secure: process.env.NODE_ENV !== 'development', // https only if prod
        sameSite: 'strict', // for CSRF attack
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })
}
export default generateToken;
```

3. import generateToken in userController

In function registerUser, when user is created
> const user= await User.create({name, email, password});

then before sending response we will call generateToken function which will create token and store in cookies of postman

```javascript
 const user= await User.create({name, email, password});
    if(user) {
        generateToken(res, user._id); // new code

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email
        })
```

In Postman, hit the post call for register user  <br />
with below data in  body -> x-www-form-urlencoded  <br />
```javascript
name: swatantra sinha
password: sinha
email: swat1508@gmail.com
```

When we click on send we can see the response like below 
```javascript
{
    "_id": "6662fad416e7fbd5912a7aa3",
    "name": "swatantra sinha",
    "email": "swat1508@gmail.com"
}
```

And also in cookies tab we can see 
jwt token with below data : 
```javascript
Name: jwt
value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjYyZmFkNDE2ZTdmYmQ1OTEyYTdhYTMiLCJpYXQiOjE3MTc3NjI3NzMsImV4cCI6MTcyMDM1NDc3M30.dtRBmAXHAtCXzbkjLIEUx0akJ8WzlpBaG2e_sX0_Sr8
Domain: localhost
Path: /
Expires: date which is 30 days after date from now
HttpOnly: true
Secure: false
```

