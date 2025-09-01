  import joi from "joi";
  import { userGender, userRole } from "../../DB/models/user.model.js";
  import { Types } from "mongoose";
import { generalRules } from "../../utils/generalRules/index.js";

  

  export const signUpSchema = {
    body:joi.object({
    name:joi.string().alphanum().min(3).max(5).required(),
    email:generalRules.email.required(),
    password:generalRules.password.required(),
    cPassword:joi.string().valid(joi.ref("password")).required(),
    gender:joi.string().valid(userGender.male,userGender.female).required(),
    age:joi.number().min(18).max(60).integer().required(),
    phone:joi.string().required(),
    // role:joi.string().valid(userRole.user,userRole.admin).required()
    // isValid:joi.boolean().falsy("0").truthy("1").required()
    // BD:joi.date().greater("now").required()
    // user:joi.object({
    //     name:joi.string().required()
    // }).length(2).required()
    // users:joi.array().items/ordered(joi.string(),joi.number())./length(2).required()
    // skills:joi.array().ordered(joi.string(),joi.string()).required(),
    // bestSkill:joi.string().valid(joi.in("skills")).required()
    
  }).required(),
  file:generalRules.file.required()
  // files:joi.array().items(generalRules.file.required()).required()
  // files:joi.array().items(generalRules.file.required()).required()

//   query:joi.object({
//    flag:joi.number().required()
//   }).required()

// headers:generalRules.headers.required()
  }

  export const signUpWithVeriCodeSchema = {
    body:joi.object({
    name:joi.string().alphanum().min(3).max(5).required(),
    email:generalRules.email.required(),
    password:generalRules.password.required(),
    cPassword:joi.string().valid(joi.ref("password")).required(),
    gender:joi.string().valid(userGender.male,userGender.female).required(),
    age:joi.number().min(18).max(60).integer().required(),
    phone:joi.string().required(),
    // role:joi.string().valid(userRole.user,userRole.admin).required()
    // isValid:joi.boolean().falsy("0").truthy("1").required()
    // BD:joi.date().greater("now").required()
    // user:joi.object({
    //     name:joi.string().required()
    // }).length(2).required()
    // users:joi.array().items/ordered(joi.string(),joi.number())./length(2).required()
    // skills:joi.array().ordered(joi.string(),joi.string()).required(),
    // bestSkill:joi.string().valid(joi.in("skills")).required()
    
  }).required(),
  // files:joi.array().items(generalRules.file.required()).required()
  // files:joi.array().items(generalRules.file.required()).required()

//   query:joi.object({
//    flag:joi.number().required()
//   }).required()

// headers:generalRules.headers.required()
  }


  export const signInSchema = {
    body:joi.object({
    email:generalRules.email.required(),
    password:generalRules.password.required(),
  }).required()
  }

   export const updatePasswordSchema = {
    body:joi.object({
    oldPassword:generalRules.password.required(),
    newPassword:generalRules.password.required(),
    cPassword:joi.string().valid(joi.ref("newPassword")).required()
  }).required(),
  }

   export const forgetPasswordSchema = {
    body:joi.object({
     email:generalRules.email.required()
  }).required(),
  }

     export const resetPasswordSchema = {
    body:joi.object({
     email:generalRules.email.required(),
     otp:joi.string().length(4).required(),
     newPassword:generalRules.password.required(),
     cPassword:joi.string().valid(joi.ref("newPassword")).required()
  }).required(),
  }


export const updateProfileSchema = {
    body:joi.object({
    name:joi.string().alphanum().min(3).max(5),
    email:generalRules.email,
    gender:joi.string().valid(userGender.male,userGender.female),
    age:joi.number().min(18).max(60).integer(),
    phone:joi.string(),
  })
  }

  export const freezeProfileSchema = {
    params:joi.object({
    id:generalRules.id
  })
  }

  export const unfreezeProfileSchema =freezeProfileSchema

  export const updateProfileImageSchema = {
     file:generalRules.file.required()
  }
