// require ('dotenv').config({path: '/.env'})
import dotenv from "dotenv"; // declare at the top so when the application loads, all the variables are available everywhere
import connectDB from "./db/index.js";

dotenv.config({ path: "./.env" }); // declare path of env variables 
// dotenv.config({ path: "./env" }); // this should also work for some system
// need to use this via experimental feature by adding some line in package.json  `-r dotenv/config --experimental-json-modules` 
import { app } from "./app.js";

//connect DB return a promise 
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is runnig on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo DB connnection failed !!! ", err);
  }); 
 



//APProach 1
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

//     app.on("error", (error) => {
//       console.log("ERROR", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("ERROR: ", error);
//     throw err;
//   }
// })();
