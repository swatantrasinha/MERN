# Backend setup with mongodb

<details>
  <summary>Step1 : Get connection string for connecting DB with code and compass </summary>

### Create Connection with MongoDB
Create Project - demo-connect-mongodb-with-node <br/> 
complete process of setup in mongodb website <br/>
and also create databse manually <br/>

### Add Data Option

- Create Database <br/>
database name: mernauth <br/>
collection name: users

- Note: We will need to URIs  <br/>
a. for connecting to compass   
b. for connecting to DB via code  

<ins>For Code : </ins> <br />
See Connect - Driver  
we will get below:  
> mongodb+srv://swatantrasinha15aug:password@demo-connection.zu17dyl.mongodb.net/?retryWrites=true&w=majority&appName=demo-connection

now in above string after  

*mongodb.net/* add the database name **mernauth**  and replace password (while coding and remove)

> mongodb+srv://swatantrasinha15aug:sinha@demo-connection.zu17dyl.mongodb.net/mernauth?retryWrites=true&w=majority&appName=demo-connection

put this in env file with  <br/>

```javascript
MONGO_URI= mongodb+srv://swatantrasinha15aug:sinha@demo-connection.zu17dyl.mongodb.net/mernauth?retryWrites=true&w=majority&appName=demo-connection
```

<ins>For Compass </ins>
See Connect - Compass
we will get below : <br/>
> mongodb+srv://swatantrasinha15aug:<password>@demo-connection.zu17dyl.mongodb.net/  

add this in compass and then we can access DB via compass <br/>


env file
--------
```javascript
NODE_ENV= development
PORT= 8000
MONGO_URI= mongodb+srv://swatantrasinha:sinha1508@mernauth.eatwkyd.mongodb.net/mernauth?retryWrites=true&w=majority
```

</details>

<details>
  <summary>Step 2. Code to connect to DB </summary>

- create new folder "config" inside "backend" folder
- create new file "db.js" inside the config folder

db.js
-----
```javascript
import mongoose from "mongoose";

const connectDB= async() => {
    try {
        const conn= await mongoose.connect(process.env.MONGO_URI);
        console.log(`Mongo DB connected : ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error : ${error.message}`);
        process.exit(1);
    }
};
export default connectDB;
```
### Add this database configuration to server.js file

server.js
---------
```javascript
import connectDB from './config/db.js';
// before const app= express();
dotenv.config();
connectDB();
```

Now start server 
```bash
npm run server
```
We can see below in console: <br />
Server started on port :  8000  
Mongo DB connected : ac-s39bhze-shard-00-01.zu17dyl.mongodb.net


So now Database connection is done
</details>

<details>
  <summary>Step3 : Create Models  </summary>

Create folder "models" in "backend" folder
inside that create file "userModel.js"

userModel.js
------------
```javascript
import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema= mongoose.Schema(
    {
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    },
    {
        timestamps: true
    });

const User= mongoose.model('User', userSchema);

export default User;
```
For this User model, we need user data from UI or postmon 
so in server.js after const app= express(); ==> we will add below 2 line to get user data in json format

---------------
```javascript
// after const app= express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
```
Note: 
- express.json() is a built express middleware that convert request body to JSON.
- express.urlencoded() just like express.json() converts request body to JSON, it also carries out some other
  functionalities like: converting form-data to JSON etc.

Now we need to use the UserModel in registerUser function inside userController.js

userController.js
-----------------

```javascript
import User from '../models/userModel.js';
const registerUser= asyncHandler(async (req, res) => {
    console.log('request body is : ', req.body);
    res.status(200).json({message: 'Register User'})
    //This will parse in json but since no data is entered it wil print {} in terminal
});
```

to send data in register request like username, password
In postman  go to body -> x-www-form-urlencoded
there is option to enter data in form of key value pair
key- name
value - swatantra sinha
Now if we hit URL we can see in console below : 
request body is :  { name: 'swatantra sinha' }

So now we can destructure name and other details and write our logic for registration
- Get name, email, password from req.body
- if user exists in DB, show error msg
- else create user and store the data in table users (collection- users) created earlier 

The complete code for function "registerUser" in userController.js is below :

userController.js
------------------

```javascript
const registerUser= asyncHandler(async (req, res) => {
    console.log('in regitration process');
    console.log('request body is : ', req.body);
    
    const {name, email, password}= req.body;
    const userExists= await User.findOne({email});
    if(userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user= await User.create({name, email, password});
    if(user) {
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
```
Now we need to use bcrypt to encrypt password before storing in DB
so in userModel.js just before - const User= mongoose.model('User', userSchema);
we will add code for bcrypt
there is function pre and post with schema that has callback functions
we will use pre here 
the complete code in userModel.js is below

userModel.js
-------------
```javascript
import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema= mongoose.Schema(
    {
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    },
    {
        timestamps: true
    });

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) { // this refer to user
        next();
    }
    const salt= await bcrypt.genSalt(10);
    this.password= await bcrypt.hash(this.password, salt)

})
const User= mongoose.model('User', userSchema);

export default User;
```

</details>

We can test the register route in POSTMAN
and can verify data stored in DB 

