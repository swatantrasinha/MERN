# Backend SetUp
Follow the below Steps for setting backend :

1. Start project : generate package.json file
```bash
npm init
```

2. install dependencies 
```bash
npm i express dotenv mongoose bcryptjs jsonwebtoken cookie-parser
```
3. create backend folder
```bash
mkdir backend 
```

4. add file server.js in the backend folder

5. Add type: "module" in package json

Instead of using commmon js we will be using ES6 modules 
so we need to add type: "module" in package json after name, version and description
this will allow to use import syntax

```bash
"type": "module",
```

6. in server.js file we will write below code: 

```javascript
import express from 'express';
const PORT= 6000;

const app= express();
app.listen(PORT, () => {
    console.log(`Server started on port :  ${PORT}`);
});

app.get('/', (req,res) => {
    res.send('Server is ready !!!!')
})
```


7. install nodemon as dev dependency
```bash
npm i -D nodemon
```


8. Add Scripts

inside scripts in package.json we will script for start and server
```bash
"start": "node backend/server.js",
"server": "nodemon backend/server.js",
```

9. start server 
```bash
npm run server
```

we can see : Server started on port :  6000

10. create env file 
We will create .env file parallel to package.json
```bash
NODE_ENV= development
PORT= 8000 
```

11. Utilize env variables in server.js file 
We will modify server.js file by adding below new lines

```javascript
import express from 'express';
import dotenv from 'dotenv'; // new

dotenv.config(); // new
const PORT= process.env.PORT || 6000; // new

const app= express();
app.listen(PORT, () => {
    console.log(`Server started on port :  ${PORT}`);
});

app.get('/', (req,res) => {
    res.send('Server is ready !!!!')
})
```

12. Git ignore file  
create .gitignore parallel to package.json and add below
```javascript
node_modules
.env
package-lock.json
```

13. Target Routes are : 

- POST : /api/users**  --> Register A User

- POST : /api/users/auth**  --> Authenticate A User and get token

- POST : /api/users/logout**  --> Logout User and Clear Cookie

- GET : /api/users/profile**  --> Get User Profile

- PUT : /api/users/profile**  --> Update User Profile

14. Complete Flow for One of the Route

Lets first complete flow for one of the routes
/api/users/auth

- Create 2 folders - "routes" and "controllers" in backend folder
- add new file userRoutes.js in routes folder
- add new file userController.js in controllers folder

userController.js
-----------------
```javascript
// @desc- Auth User set token
// route - POST api/user/auth
// access - Public 
const authUser = (req,res) => {
    res.status(200).json({message: 'Auth User'})
}
```

userRoute.js
------------
```javascript
import express from 'express';
import { authUser } from '../controllers/userController.js';

const router = express.Router();
router.post('/auth', authUser)

export default router;
```

server.js
---------
```javascript
import userRoutes from './routes/userRoutes.js' // new
const app= express();

app.use('/api/users', userRoutes) // new

app.get('/', (req,res) => {
    res.send('Server is ready !!!!')
})
```

14. Open Postman and test routes

Create Workspace- MERN Auth  

Create collection - User  

in environment - put this http://localhost:8000/api as baseUrl

Inside User - create a new route : {{baseUrl}}/users/auth 

now hit a POST request 

it will show response 
{
    "message": "Auth user"
}

16. use of express-async-handler


Going further most of request will be async so will install express-async-handler 
```bash
npm i express-async-handler
```

and then make userController.js- userAuth function as async. See below :
```javascript

import asyncHandler from 'express-async-handler';

// @desc- Auth User set token
// route - POST api/user/auth
// access - Public 
/* old code
const authUser = (req,res) => {
    res.status(200).json({message: 'Auth User'})
}
*/
const authUser= asyncHandler(async (req, res) => {
    res.status(200).json({message: 'Auth user'})
});
```


Note: this async handler will also allow to use custom error handler


16. create error-handler
- create a new folder "middleware" parallel to controllers

- inside this create a new file errorMiddleware.js

we will create 2 function here - notFound and errorHandler

errorMiddleware.js
-------------------
```javascript
const notFound= (req,res,next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404);
    next(error);
}

const errorHandler = (error, req,res,next) => {
    let statusCode= res.statusCode === 200 ? 500 : res.statusCode;
    let message= error.message;
    if(error.name === 'CastError' && error.kind === 'ObjectId') {
        statusCode = 404;
        message= 'Resource Not Found';
    }
    res.status(statusCode).json({
        message,
        stack: process.env === 'production' ? null : error.stack
    });
}

export {notFound, errorHandler};
```


In server.js add this 2 function for error handling
-----------------------------------------------------

server.js
---------
```javascript
import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'; // new
dotenv.config();
const PORT= process.env.PORT || 6000;

const app= express();

app.use('/api/users', userRoutes) 

app.get('/', (req,res) => {
    res.send('Server is ready !!!!')
})

app.use(notFound) // new
app.use(errorHandler) // new

app.listen(PORT, () => {
    console.log(`Server started on port :  ${PORT}`);
    console.log("env is : ", process.env.NODE_ENV)
});

```


17. Till now the basic setup for one of routes -  /users/auth
is done and we can check for error case also 

Now we will add some more routes as in point 13

Note: In userController.js - we have function authUser
now we will add code for below functions
- registerUser
- logoutUser
- getUserProfile
- updateUserProfile

and export these functions to be used in userRoute.js


userController
--------------
```javascript
import asyncHandler from 'express-async-handler';

// @desc  Auth user/set token
// route  POST /api/users/auth
// @access Public
const authUser= asyncHandler(async (req, res) => {
    res.status(200).json({message: 'Auth user'})
});


// @desc  register a new user
// route  POST /api/users
// @access Public
const registerUser= asyncHandler(async (req, res) => {
    res.status(200).json({message: 'Register User'})
});

// @desc  logout user
// route  POST /api/logout
// @access Public
const logoutUser= asyncHandler(async (req, res) => {
    res.status(200).json({message: 'Logout User'})
});


// @desc  get user profile
// route  GET /api/users/profile
// @access Private
const getUserProfile= asyncHandler(async (req, res) => {
    res.status(200).json({message: 'User Profile'})
});

// @desc  update user profile
// route  PUT /api/users/profile
// @access Private
const updateUserProfile= asyncHandler(async (req, res) => {
    res.status(200).json({message: 'Update User Profile'})
});

export {authUser, registerUser, logoutUser, getUserProfile, updateUserProfile};
```




In userRoute.js - we will import these function add routing code:

userRoute.js
------------
```javascript

import express from 'express';
import { authUser, <mark> registerUser, logoutUser, getUserProfile, updateUserProfile </mark> } from '../controllers/userController.js'; // new

const router = express.Router();
<mark>
router.post('/', registerUser) //new
</mark>
router.post('/auth', authUser)
<mark>
router.post('/logout', logoutUser) // new
router.route('/profile').get(getUserProfile).put(updateUserProfile) // new
</mark>
export default router;

```


The basic setup is done 
