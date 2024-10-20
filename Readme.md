# Chai Aur Backend

# Chapter 1

initialise the project --> npm init

.gitignore generator
.env --> hides the envirnment variables 

folder structure 
./src/
    app.js 
    constants.js 
    index.js

package.json
   "type": "module" // for using import format (preferred)
    "type": "commonjs" // for using require format

    npm i -D nodemon // dev dependency 
        "script":{
            "dev":"nodemon src/index.js" --> npm run dev
        }

folder structure
./src/
    controllers
    db --> database connection logic
    middlewares
    models
    routes
    utils --> utilities, functions that are used in many places

# Chapter 2
MongoDB setup
IP list || security --> allow access from anywhere 0.0.0.0/0

.env
    PORT=8000
    MONGODB_URI=mongodb+srv://divyansh:divyansh@cluster0.70d8n.mongodb.net

constants.js 
    export const DB_NAME = "<name>";

Connecting to Database
npm install     express    mongoose   dotenv
--> Connect with DB and then make the app liste at port

./src/index.js 
    Approach 1 IIFE function
    Approach 2 : create a function in a separate folder and make a call in src/index.js file 
        ./src/db/index.js --> connectDB(); declaration and defination
        ./src/index.js --> connectDB() is called     

./src/utils.js/asyncHandler.js --> asyncHandler function
    takes a function and call it with async and await

./src/utils.js/ApiError.js --> Standard format for error response
./src/utils.js/ApiResponse.js --> Standard format for response

# chapter 3
Models --> ./src/models/user.model.js 
    import mongoose from "mongoose";
    const userSchema = new mongoose.Schema({...models objects})
    export const User = mongoose.model("User", userSchema)

import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index:true,        
    },
    <model-object-name> :{
        type: Schema.Types.ObjectId, ref : "Video"
    },
    <model-object-name> :{
        required: [true, 'Password is required'],
        type: Number,
        default: 0,
        type: Boolean,
        default: true
    },

},{timestamps:true})

export const User = mongoose.model("User", userSchema)
-------------------------------------------------------
JWT  
npm install bcrypt jsonwebtoken 

./src/models/user.model.js

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";  ////bcrypt hashes the password 

    // arrow function is not used as they do not have access of "this"
    //pre method check the status before saving the data.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();  isModified checks if the field is modified

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//checkes the password with bcrypt || methods. can be used to add multiple functions
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

-------------------------------------------------
TOKENISATION
    .env --> 
    ACCESS_TOKEN_SECRET=asdfghjkl
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=qwertyuiop
    REFRESH_TOKEN_EXPIRY=10d

./src/models/user.model.js

Access token
------
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { 
      _id: this._id,
      email: this.email,
      username: this.userSchema,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

Refresh token
------
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

# chapter 4
multer || express file upload 
npm i cloudinary multer

.env 
    CLOUDINARY_CLOUD_NAME=divyanshcloud
    CLOUDINARY_API_KEY=217675346444945
    CLOUDINARY_APT_SECRET=5c8CxPaP3WVXuckDudJf_wupXmE

STRATERGY -> take file from user, upload it on our system temporarly and then upload it on cloudinary

./src/utlis/cloudinary.js
----------
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_APT_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded successfully
    // console.log("File is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath)
    // console.log(response) 
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // removes the locally saved temp file as the upload operatn got failed
    return null;
  }
};

export { uploadOnCloudinary };

./src/middleware/multer.middleware.js
----------
import multer from "multer";

const storage = multer.diskStorage({
    destination : function (req, file, cb){
        cb(null, "./public/temp")
    },
    filename : function (req, file, cb){
        cb(null, file.originalname)
    }
})

export const upload = multer({storage: storage})

# chapter 5

./src/controller/user.controller.js
-------------
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({message : "OKzz"})
})

export {registerUser}

./src/routes/user.routes.js
-----------------------
import express from "express";

const router = express.Router();
router.route("/register").post(registerUser); // import registerUser from user.controller.js
OR
router.post("/register", registerUser); // import registerUser from user.controller.js

export default router;

.src/app.js
------------
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//app.use(cors()); you can also pass an object with options  app.use(cors({...options list}));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); //accept json data of limit 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //data from url comes with % or & in place of space
app.use(express.static("public")); //public folder, contains assests 
app.use(cookieParser()); //access and set cookies from server 

//routes import
import userRouter from "./routes/user.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register

export { app };
 
# chapter 6
./src/controller/user.controller.js

const registerUser = asyncHandler(async(req, res)=>{
  get user details from frontend
  validation -> not empty
  check if user already exist : username ,  email
  check for images,check for avatar
  upload them to cloudinary , avatar
  create user object- create entry in db
  remove password and refresh token field from response
  check for user creation
  return res
})

# chapter 7
./src/controller/user.controller.js

const loginUser = asyncHandler(async (req, res) => {
  // Destructure email, username, and password from the request body   const { email, username, password } = req.body;
  // Ensure either username or email is provided
  // Find the user by either username or email
  // If user doesn't exist, throw an error
  // Check if the provided password is correct
  // If password is invalid, throw an error
  // Generate access and refresh tokens
  // Exclude password and refreshToken from the user data
  // Set cookie options to prevent access from client-side scripts
  // Send response with tokens and user data
});


