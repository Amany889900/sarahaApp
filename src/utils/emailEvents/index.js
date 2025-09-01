import {EventEmitter} from "events"
import { generateToken } from "../token/generateToken.js"
import { sendEmail } from "../../service/sendEmail.js";
import { nanoid } from "nanoid";
import otpModel from "../../DB/models/otp.model.js";
import { Hash } from "../Hash/hash.js";

export const eventEmitter = new EventEmitter()

eventEmitter.on("sendEmail",async(data)=>{
  // generate confirm link
  const {email} = data;
  const token = await generateToken({payload:{email},SIGNATURE:process.env.SIGNATURE,options:{expiresIn:60*3}});
  const link = `http://localhost:3000/users/confirmEmail/${token}`;

  const isSent = await sendEmail({
    to:email,
    subject:"confirm email",
    html:`<a href='${link}'>confirm email</a>`
  });

  if(!isSent){
    throw new Error("failed to send email")
  }
})

eventEmitter.on("forgetPassword",async(data)=>{
  // generate confirm link
  const {email,otp} = data;
 
  //send otp confirmation

  const isSent = await sendEmail({
    to:email,
    subject:"forget password",
    html:`<h1>otp:${otp}</h1>`
  });

  if(!isSent){
    throw new Error("failed to send email")
  }
})

eventEmitter.on("sendVeriCode",async(data)=>{
  // generate confirm link
  const code = nanoid(4);
  const hashedCode = await Hash({
    plainText:code,
    SALT_ROUNDS:process.env.SALT_ROUNDS
  })

  const otp = otpModel.create({
     userId:data.id,
     code:hashedCode,
     expiryAt: Date.now() + 5*60*1000
  });

  const isSent = await sendEmail({
    to:data.email,
    subject:"confirm email",
    html:`<strong>${code}</strong>`
  });

  if(!isSent){
    throw new Error("failed to send email")
  }
})