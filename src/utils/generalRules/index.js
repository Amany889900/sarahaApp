import joi from "joi";
import { Types } from "mongoose";

export const customId = (value,helper)=>{
    const data = Types.ObjectId.isValid(value);
    return data? value: helper.message("Invalid Id")
  }

export const generalRules = {
 email:joi.string().email({tlds:{allow:["com","org"]},minDomainSegments:2, maxDomainSegments:3}),
 password:joi.string(),
 id:joi.string().custom(customId),
 headers:joi.object({
authorization:joi.string().required(),
host:joi.string().required(),
"accept-encoding":joi.string().required(),
"content-type":joi.string().required(),
"content-length":joi.string().required(),
"postman-token":joi.string().required(),
"connection":joi.string().required(),
"cache-control":joi.string().required(),
"accept":joi.string().required(),
"user-agent":joi.string().required(),
}),
file:joi.object({
  size:joi.number().positive().required(),
  path:joi.string().required(),
  filename:joi.string().required(),
  destination:joi.string().required(),
  mimetype:joi.string().required(),
  encoding:joi.string().required(),
  originalname:joi.string().required(),
  fieldname:joi.string().required()
}).messages({
  "any.required":"file is required"
})
}