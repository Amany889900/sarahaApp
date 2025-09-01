import checkConnectionDB from "./DB/connectionDB.js";
import messageModel from "./DB/models/message.model.js";
import userModel from "./DB/models/user.model.js";
import { globalErrorHandling } from "./middleware/globalErrorHandling.js";
import userRouter from "./modules/users/user.controller.js"
import messageRouter from "./modules/messages/message.controller.js"

import cors from "cors" // 3shan nsm7 ll frontend yb3tlna request

import morgan from "morgan" //by3ml log ll requests el bb3tha
import chalk from "chalk"

import {rateLimit} from "express-rate-limit" //by limit 3dd el requests
import helmet from "helmet" //security

import cron from "node-cron"
import otpModel from "./DB/models/otp.model.js";

var whitelist = [process.env.FRONT_ORIGIN,undefined] //3shan nsm7 l postman
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const bootstrap = async (app,express)=>{

  const limiter = rateLimit({
    windowMs: 60*1000,
    max:10,
    // 1 minute of max 5 requests per window
    // message:{
    //   error:"Too many requests"
    // },
    // statusCode:400
    handler:(req,res,next,options)=>{
      res.status(400).json({
        error:"Game Over!!"
      })
    },
    legacyHeaders:false,
    skipSuccessfulRequests:true, // b3d 3leh el m7wlat el fshla bs
    // skipFailedRequests
  })
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("dev")); // byfr2 f shkl el log
app.use(limiter); // momken ash8lha 3la routing mo3yn bs
app.use(express.json());

app.get('/',(req,res)=>{
    res.status(200).json({message:"Welcome to saraha app"})
})

checkConnectionDB();
app.use("/uploads",express.static("uploads")) // folder el uploads static

app.use("/users",userRouter);
app.use("/messages",messageRouter);

app.use("{/*demo}",(req,res,next)=>{
    throw new Error(`Url not found ${req.originalUrl}`,{cause:404});
    // return res.status(404).json({message:`Url not found ${req.originalUrl}});
})

cron.schedule(" */10 * * * * *",async()=>{
  let otps = await otpModel.deleteMany({expiryAt:{$lt:new Date()}});
  // console.log(otps);
})
app.use(globalErrorHandling);

}

export default bootstrap