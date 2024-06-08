# Setup with MongoDB and JWT
----------------------------

MongoDB setup is already done in branch **backend-setup-with-mongodb**
here we will do setup for JWT authentication
 
<details>
  <summary> Registration- Generate token and store in cookie </summary>
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
</details>


<details>
  <summary> Authentication - Validate the token stored in cookie </summary>

userModel.js
--------------
We need to compare encoded password stored in DB with password enntered by user <br/>
for this we will use compare method from bcrypt and create below function matchPassword 
after 
>  userSchema.pre .... // encoding logic

```javascript
userSchema.methods.matchPassword= async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
```

Now we will utilize this matchPassword in userController  <br/>

In userController.js file -->  authUser function  <br />
 we have the below code :
 
 ```javascript
const authUser= asyncHandler(async (req, res) => {
    res.status(200).json({message: 'Auth user'})
});
```
We will modify this to  as below :
```javascript
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
```
We can test our POST call route for User Auth /users/auth in POSTMAN
with below data in  body -> x-www-form-urlencoded  <br />
```javascript
name: swatantra sinha
password: sinha
email: swat1508@gmail.com
```

we will get response :
```javascript
{
    "_id": "6662fad416e7fbd5912a7aa3",
    "name": "swatantra sinha",
    "email": "swat1508@gmail.com"
}
```

</details>



<details>
<summary> Logout - Delete JWT token from cookie </summary>
 <br />
 
 We have function logoutUser in userController.js with below code:  

 ```javascript
const logoutUser= asyncHandler(async (req, res) => {
    res.status(200).json({message: 'Logout User'})
});
```
We will modify it to below : 


userController.js
-----------------

 ```javascript
const logoutUser= asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0), // expires right now
    })
    res.status(200).json({message: 'User Logged Out'})
});
```
</details>

<details>
<summary> Protecting Routes: Use Cookies  </summary>
Since register , login and logout is done so now we will proceed for protecting routes


1. To use cookies stores we need cookie-parser which we have already installed. <br />
So in server.js lets make changes to use cookie-parser before below line :<br />


> app.use('/api/users', userRoutes)

```javascript
import cookieParser from 'cookie-parser';

app.use(cookieParser()); // new code 
app.use('/api/users', userRoutes)
```
2. In middleware folder create new file- authMiddleware.js and create function protect <br/>
where we will use jwt.verify method to decode token <br />

```javascript
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
```

> In above we are not exporting as default as we may need to add some more authentication middleware like admin because some routes may not want admin access

<br />
At this point we have not added this middleware
so if we call users/profile we will be able to access it

Lets add protect middleware in userRoute

3. Add protect middleware in userRoute and modify getUserProfile in userController


userRoute.js
------------
> import {protect} from '../middleware/authMiddleware.js'

and the existing code below 
```javascript
router
    .route('/profile')
    .get( getUserProfile)
    .put(  updateUserProfile)
```
will be removed and new code with protect middleware will be added

```javascript
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put( protect, updateUserProfile)
```

Now first hit logout api so that token from cookie gets deleted and then hit getProfile api
it will show error
> "message": "Not authorized, no token"

if we hit login api(/users/auth) once (token gets added in cookie)
and then hit getProfile api it will be successful

Now if we see getUserProfile function in userController
```javascript
const getUserProfile= asyncHandler(async (req, res) => {
    res.status(200).json({msg: 'Get User Profile Called'})
});
```
It simply returns the response of 200 with msg <br />
However in protect middle req is added with req.user of autthenticated user 
so it has user's id,name and email which we can extract from it
Note: password is not there in req.user as we have removed in authMiddleware <br />

> req.user= await User.findById(decoded.userId).select('-password');

We have 2 option to display user profile 
- if password is not needed to display- can display data(id, name, email) from req.user
- if passwors needs to be displayed- take id from req.user and fetch data from database to display it


```javascript
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
``` 
</details>




