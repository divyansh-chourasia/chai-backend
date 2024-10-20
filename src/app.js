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
 