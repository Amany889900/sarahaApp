import userModel, { userProviders, userRole } from "../../DB/models/user.model.js";
import { sendEmail } from "../../service/sendEmail.js";
import { generateToken,verifyToken,Hash,Compare,Encrypt,Decrypt,eventEmitter} from "../../utils/index.js";

import {customAlphabet, nanoid} from "nanoid"
import RevokeTokenModel from './../../DB/models/revoke-token.model.js';
import {OAuth2Client} from 'google-auth-library';
import cloudinary from "../../utils/cloudinary/index.js";
import { compare } from "bcrypt";
import otpModel from "../../DB/models/otp.model.js";


// const asyncHandler = (fn)=>{
//   return (req,res,next)=>{
//      fn(req,res,next).catch((error)=>{
//        return next(error) // 3shan troo7 ll global error handler
//      })
//   }
// }

export const signUp = async(req,res,next)=>{

  const {name,email,password,cPassword,phone,gender,age} = req.body;

  // if(!req?.files.length){
  //   throw new Error("file is required");
  // }

  const {secure_url,public_id} = await cloudinary.uploader.upload(req?.file?.path,{
  folder:"sarahaApp/users/profileImage",
  // use_filename:true,
  // unique_filename:false,
  // resource_type:"auto"
 })

//check password equality (for optimization to avoid unnessecary db lookup)
//  if(password!==cPassword){
//     return res.status(400).json({message:"Confirm password is not equal to password"});
//  }

 //check if user already exists
 const existingUser = await userModel.findOne({email});

 if(existingUser){
  throw new Error("Email already exists",{cause:409}); //better to return the control to the parent function
  // return next(new Error("Email already exists"))
  // return res.status(409).json({message:"Email already exists"});
 }

 //hash password
//  const hashedPassword = bcrypt.hashSync(password,+process.env.SALT_ROUNDS); // + to convert it into number
 const hashedPassword = await Hash({plainText:password,SALT_ROUNDS:process.env.SALT_ROUNDS}); 

 //encrypt phone
//  var encryptedPhone = CryptoJS.AES.encrypt(phone,process.env.SECRET_KEY).toString()
 var encryptedPhone = await Encrypt({plainText:phone,SECRET_KEY:process.env.SECRET_KEY})

 eventEmitter.emit("sendEmail",{email})
//  const token = jwt.sign({email},process.env.SIGNATURE,{expiresIn:3*60})

// let arrPaths=[]
//  //coverImages
//  for (const file of req?.files){
//    arrPaths.push(file?.path);
//  }
  const newUser = await userModel.create({name,email,password:hashedPassword,phone:encryptedPhone,gender,age,profileImage:{secure_url,public_id}});
  return res.status(201).json({message:"User created successfully",newUser,file:req.file});
}


export const signUpWithVeriCode = async(req,res,next)=>{

  const {name,email,password,cPassword,phone,gender,age} = req.body;

  // if(!req?.files.length){
  //   throw new Error("file is required");
  // }

//   const {secure_url,public_id} = await cloudinary.uploader.upload(req?.file?.path,{
//   folder:"sarahaApp/users/profileImage",
//   // use_filename:true,
//   // unique_filename:false,
//   // resource_type:"auto"
//  })

//check password equality (for optimization to avoid unnessecary db lookup)
//  if(password!==cPassword){
//     return res.status(400).json({message:"Confirm password is not equal to password"});
//  }

 //check if user already exists
 const existingUser = await userModel.findOne({email});

 if(existingUser){
  throw new Error("Email already exists",{cause:409}); //better to return the control to the parent function
  // return next(new Error("Email already exists"))
  // return res.status(409).json({message:"Email already exists"});
 }

 //hash password
//  const hashedPassword = bcrypt.hashSync(password,+process.env.SALT_ROUNDS); // + to convert it into number
 const hashedPassword = await Hash({plainText:password,SALT_ROUNDS:process.env.SALT_ROUNDS}); 

 //encrypt phone
//  var encryptedPhone = CryptoJS.AES.encrypt(phone,process.env.SECRET_KEY).toString()
 var encryptedPhone = await Encrypt({plainText:phone,SECRET_KEY:process.env.SECRET_KEY})


//  const token = jwt.sign({email},process.env.SIGNATURE,{expiresIn:3*60})

// let arrPaths=[]
//  //coverImages
//  for (const file of req?.files){
//    arrPaths.push(file?.path);
//  }
  const newUser = await userModel.create({name,email,password:hashedPassword,phone:encryptedPhone,gender,age});
  eventEmitter.emit("sendVeriCode",{email:newUser.email,id:newUser._id})
  return res.status(201).json({message:"User created successfully",newUser,file:req.file});
}

export const signIn = async(req,res,next)=>{
 
  const {email,password} = req.body;
  
  //check the existence of the user
  const existingUser = await userModel.findOne({email,confirmed:true})
  if(!existingUser){
    throw new Error("Email does not exist or not confirmed yet",{cause:404});
    // return res.status(404).json({message:"Email does not exist or not confirmed yet"});
  }
 // compare password
  const matchedPassword = await Compare({plainText:password,cipherText:existingUser.password});
  if(!matchedPassword){
    throw new Error("Password is incorrect",{cause:400});
    // return res.status(400).json({message:"Password is incorrect"});   
  }
  //create token
  // const access_token = jwt.sign({id:existingUser._id,email},existingUser.role==userRole.user? process.env.ACCESS_TOKEN_USER:process.env.ACCESS_TOKEN_ADMIN,{expiresIn:'1h'});
  // const refresh_token = jwt.sign({id:existingUser._id,email}, existingUser.role==userRole.user? process.env.REFRESH_TOKEN_USER:process.env.REFRESH_TOKEN_ADMIN,{expiresIn:'1y'});
  const access_token = await generateToken({payload:{id:existingUser._id,email:existingUser.email},SIGNATURE:existingUser.role==userRole.user?process.env.ACCESS_TOKEN_USER:process.env.ACCESS_TOKEN_ADMIN,options:{expiresIn:'1h',jwtid:nanoid()}})
  const refresh_token = await generateToken({payload:{id:existingUser._id,email:existingUser.email},SIGNATURE:existingUser.role==userRole.user? process.env.REFRESH_TOKEN_USER:process.env.REFRESH_TOKEN_ADMIN,options:{expiresIn:'1y',jwtid:nanoid()}})
  return res.status(200).json({message:"success",access_token,refresh_token });
 
}

export const signInWithVeriCode = async(req,res,next)=>{
 
  const {email,password} = req.body;
  
  //check the existence of the user
  const existingUser = await userModel.findOne({email})
  if(!existingUser){
    throw new Error("Email does not exist",{cause:404});
    // return res.status(404).json({message:"Email does not exist or not confirmed yet"});
  }

  if(!existingUser.confirmed){
    if(existingUser.isBanned){
      let banTime = existingUser.bannedAt.getTime() + 5*60*1000;
      if(banTime>Date.now()){
        let diff = banTime-Date.now();
        let minutes = Math.ceil(diff/(60 *1000));
        return res.status(403).json({
          message:`You are banned, try again after ${minutes} minutes`
        })
      }}else{
        existingUser.isBanned = false;
        existingUser.bannedAt = null;
        await existingUser.save();
        eventEmitter.emit("sendVeriCode",{email:existingUser.email,id:existingUser._id});
        return res.status(403).json({
          message:"You are not confirmed yet, please check your email for confirmation"
        })
      
    }
  }
 // compare password
  const matchedPassword = await Compare({plainText:password,cipherText:existingUser.password});
  if(!matchedPassword){
    throw new Error("Password is incorrect",{cause:400});
    // return res.status(400).json({message:"Password is incorrect"});   
  }
  //create token
  // const access_token = jwt.sign({id:existingUser._id,email},existingUser.role==userRole.user? process.env.ACCESS_TOKEN_USER:process.env.ACCESS_TOKEN_ADMIN,{expiresIn:'1h'});
  // const refresh_token = jwt.sign({id:existingUser._id,email}, existingUser.role==userRole.user? process.env.REFRESH_TOKEN_USER:process.env.REFRESH_TOKEN_ADMIN,{expiresIn:'1y'});
  const access_token = await generateToken({payload:{id:existingUser._id,email:existingUser.email},SIGNATURE:existingUser.role==userRole.user?process.env.ACCESS_TOKEN_USER:process.env.ACCESS_TOKEN_ADMIN,options:{expiresIn:'1h',jwtid:nanoid()}})
  const refresh_token = await generateToken({payload:{id:existingUser._id,email:existingUser.email},SIGNATURE:existingUser.role==userRole.user? process.env.REFRESH_TOKEN_USER:process.env.REFRESH_TOKEN_ADMIN,options:{expiresIn:'1y',jwtid:nanoid()}})
  return res.status(200).json({message:"success",access_token,refresh_token });
 
}

export const loginWithGmail = async(req,res,next)=>{
 
  const {idToken} = req.body;

  const client = new OAuth2Client();
  async function verify() {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  return payload;
  // If the request specified a Google Workspace domain:
  // const domain = payload['hd'];
}
const {email,email_verified,picture,name} = await verify()
let existingUser = await userModel.findOne({email})
  if(!existingUser){
    user = await userModel.create({
      name,
      email,
      confirmed:email_verified,
      image:picture,
      password:nanoid(), // ay value
      provider:userProviders.google
    }) //b2eet el fields htdrb validationError => required
  }
  

  if(user.provider !== userProviders.google){
    throw new Error("Please login on system")
  }
 
  const access_token = await generateToken({payload:{id:existingUser._id,email:existingUser.email},SIGNATURE:existingUser.role==userRole.user?process.env.ACCESS_TOKEN_USER:process.env.ACCESS_TOKEN_ADMIN,options:{expiresIn:'1h',jwtid:nanoid()}})
  const refresh_token = await generateToken({payload:{id:existingUser._id,email:existingUser.email},SIGNATURE:existingUser.role==userRole.user? process.env.REFRESH_TOKEN_USER:process.env.REFRESH_TOKEN_ADMIN,options:{expiresIn:'1y',jwtid:nanoid()}})
 
  return res.status(200).json({message:"success",access_token,refresh_token});

 
}

export const getProfile = async(req,res,next)=>{
        // var phone = CryptoJS.AES.decrypt(req.existingUser.phone,process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
        var phone = await Decrypt({cipherText:req.existingUser.phone,SECRET_KEY:process.env.SECRET_KEY}).toString(CryptoJS.enc.Utf8);
        req.existingUser.phone = phone;
        return res.status(200).json({message:"success",user:req.existingUser});     
}

export const confirmEmail = async(req,res,next)=>{ 
        const {token} = req.params;

        if(!token){
          throw new Error("token does not exist",{cause:400});
            // return res.status(404).json({message:"token does not exist"});
        }
        const decoded_access_token = await verifyToken({token,SIGNATURE:process.env.SIGNATURE});
        if(!decoded_access_token?.email){
          throw new Error("Invalid token",{cause:400});
        }
        const existingUser = await userModel.findOne({email:decoded_access_token.email,confirmed:false});
        if(!existingUser){
          throw new Error("User does not exist or already confirmed",{cause:404});
        //  return res.status(404).json({message:"User does not exist or already confirmed"});
        }
        
        existingUser.confirmed = true;
        await existingUser.save();
        return res.status(200).json({message:"Email confirmed successfully"});  
}

export const confirmVeriCode = async(req,res,next)=>{ 
        const {code,email} = req.body;

        if(!code || !email){
          throw new Error("code or email does not exist",{cause:400});
            // return res.status(404).json({message:"token does not exist"});
        }
        
        const existingUser = await userModel.findOne({email:email,confirmed:false});
        if(!existingUser){
          throw new Error("User does not exist or already confirmed",{cause:404});
        //  return res.status(404).json({message:"User does not exist or already confirmed"});
        }

        //check if code is correct
        const otp = await otpModel.findOne({userId:existingUser._id})
        if(!otp){
          throw new Error("otp does not exist for this user",{cause:404})
        }
        if(otp.expiryAt < Date.now()){
           await otpModel.deleteOne({_id:otp._id});
           eventEmitter.emit("sendVeriCode",{email:existingUser.email,id:existingUser._id});
          throw new Error("Veri code is expired new code was sent to your email",{cause:400});
        }
        if(otp.isUsed){
          throw new Error("Otp is already used");
        }
        if(existingUser.isBanned){
          let banTime = existingUser.bannedAt.getTime() + 5*60*1000;
          if(banTime>Date.now()){
            let diff = banTime - Date.now();
            let minutes = Math.ceil(diff/(60 * 1000));
            return res.status(403).json({
              message:`You are banned, login after ${minutes} minutes`
            })
          }else{
            existingUser.isBanned = false;
            existingUser.bannedAt = null;
            await existingUser.save();
            eventEmitter.emit("sendVeriCode",{email:existingUser.email,id:existingUser._id});
          return res.status(403).json({
          message:"please check your email for new confirmation"
        })
          }
        }
        
        const storedVeriCode = await Compare({plainText:code,cipherText:otp.code});

        if(storedVeriCode){
          existingUser.confirmed = true;
          await existingUser.save();
          otp.isUsed = true;
          await otp.save();
          return res.status(200).json({message:"Email confirmed successfully"});  
        }else{
          otp.attempts++;
          await otp.save();
          // console.log(otp.attempts)
          if(otp.attempts>=5){
          existingUser.isBanned = true;
          existingUser.bannedAt = Date.now();
          await existingUser.save();
          await otpModel.deleteOne({_id:otp._id});
          throw new Error("You have reached the max attempts try again after 5 minutes",{cause:400});
        }
          throw new Error(`Invalid code you have ${5-otp.attempts} left`,{cause:400});
        }
        
        
}


export const logout = async(req,res,next)=>{
   
    const revokeToken = await RevokeTokenModel.create({
      tokenId:req.decoded_access_token.jti,
      expireAt:req.decoded_access_token.exp
    })
    return res.status(200).json({message:"success"});     
}

export const refreshToken = async(req,res,next)=>{
   
   const {authorization} = req.headers;
    //  if(!authorization){
    //     return res.status(404).json({message:"token does not exist"});
    //  }
     const [prefix,token] = authorization.split(" ") || []; // hnst8na 3nd el condition el fo2
     if(!prefix || !token){
        throw new Error("token does not exist");
     }
     let signature = "";
     if(prefix == "bearer"){
        signature = process.env.REFRESH_TOKEN_USER;
     }else if(prefix=="admin"){
        signature=process.env.REFRESH_TOKEN_ADMIN;
     }else{
       throw new Error("Invalid prefix");
     }
     const decoded_access_token = await verifyToken({token:token,SIGNATURE:signature});
     if(!(decoded_access_token?.email)){
       throw new Error("Invalid token",{cause:400});
     }
     const revoked = await RevokeTokenModel.findOne({tokenId:decoded_access_token.jti});
     if(revoked){
      throw new Error("Please login again",{cause:400});
     }
     const existingUser = await userModel.findOne({email:decoded_access_token.email});
    if(!existingUser){
      throw new Error("User does not exist",{cause:404});
    }
  const access_token = await generateToken({payload:{id:existingUser._id,email:existingUser.email},SIGNATURE:existingUser.role==userRole.user?process.env.ACCESS_TOKEN_USER:process.env.ACCESS_TOKEN_ADMIN,options:{expiresIn:'1h',jwtid:nanoid()}})
  const refresh_token = await generateToken({payload:{id:existingUser._id,email:existingUser.email},SIGNATURE:existingUser.role==userRole.user? process.env.REFRESH_TOKEN_USER:process.env.REFRESH_TOKEN_ADMIN,options:{expiresIn:'1y',jwtid:nanoid()}})
  return res.status(200).json({message:"success",access_token,refresh_token });
}

export const updatePassword = async(req,res,next)=>{
        const {oldPassword,newPassword}=req.body;

        if(!Compare({plainText:oldPassword,cipherText:req.existingUser.password})){
          throw new Error("Invalid old Password")
        }

        const hashedPassword = await Hash({plainText:newPassword});

        req.existingUser.password = hashedPassword;
        await req.existingUser.save();

        //revoke token cause it is not valid anymore
        await RevokeTokenModel.create({
          tokenId:req?.decoded_access_token?.jti,
          expireAt:req?.decoded_access_token?.exp
        })

        return res.status(200).json({message:"success",user:req.existingUser});     
}

export const forgetPassword = async(req,res,next)=>{
  const {email} = req.body;

  //check email
  const user = await userModel.findOne({email});

  if(!user){
    throw new Error("User does not exist",{cause:404})
  }

  const otp = customAlphabet("0123456789",4)();
  eventEmitter.emit("forgetPassword",{email,otp});
  user.otp = await Hash({plainText:otp});
  await user.save();
  return res.status(200).json({message:"success"})
}

export const resetPassword = async(req,res,next)=>{
  const {email,otp,newPassword} = req.body;

  //check email
  const user = await userModel.findOne({email,otp:{$exists:true}});

  if(!user){
    throw new Error("User does not exist",{cause:404})
  }
  
  if(!await Compare({plainText:otp,cipherText:user?.otp})){
    throw new Error("Invalid otp");
  }
  const hashedPassword = await Hash({plainText:newPassword});
  await userModel.updateOne({email},{
    password:hashedPassword,
    $unset:{otp:""} //ems7 el otp 3shan yb2a valid mara wa7da
  })
  return res.status(200).json({message:"success"})
}

export const updateProfile = async(req,res,next)=>{
       
  const {age,gender,phone,email,name} = req.body;
  if(name) req.existingUser.name = name;
  if(gender) req.existingUser.gender = gender;
  if(age) req.existingUser.age = age;
  if(phone){
  // var phone = CryptoJS.AES.decrypt(req.existingUser.phone,process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
        var encryptedPhone = await Encrypt({plainText:phone,SECRET_KEY:process.env.SECRET_KEY});
        req.existingUser.phone = encryptedPhone;
  }
  if(email){
   const user = await userModel.findOne({email});
   if(user){
    throw new Error("Email already exists")
   }
   eventEmitter.emit("sendEmail",{email})
   req.existingUser.email = email;
   req.existingUser.confirmed = false;
  }
  await req.existingUser.save();
        
        return res.status(200).json({message:"success",user:req.existingUser});     
}


export const getProfileData = async(req,res,next)=>{
        const {id} = req.params;
        const user = await userModel.findById(id).select("-password -role -confirmed -phone -createdAt -updatedAt -__v");

        if(!user){
           throw new Error("User does not exist",{cause:404})
        }

        return res.status(200).json({message:"success",user});     
}


export const freezeProfile = async(req,res,next)=>{
       
  const{id} = req.params; //admin by3ml freeze f byb3t id aw user by3ml l nfso f msh hyb3t id mynf3sh user y3ml user tany
  
  if(id && req.existingUser.role!==userRole.admin){
    throw new Error("You are not allowed to freeze this account")
  }

  const user=await userModel.updateOne({
    _id:id||req.existingUser._id,
    isDeleted:{$exists:false}
  },{
    isDeleted:true,
    deletedBy:req.existingUser._id
  },
  {
  $inc:{__v:1}
  })
  
  user.matchedCount?res.status(200).json({message:"success",user:req.existingUser}):res.status(400).json({message:"failed to freeze"});     
}


export const unfreezeProfile = async(req,res,next)=>{
       
  const{id} = req.params; //admin by3ml freeze f byb3t id aw user by3ml l nfso f msh hyb3t id mynf3sh user y3ml user tany
  
  if(id && req.existingUser.role!==userRole.admin){
    throw new Error("You are not allowed to freeze this account")
  }

  const user=await userModel.updateOne({
    _id:id||req.existingUser._id,
    isDeleted:{$exists:true}
  },{
    $unset:{isDeleted:"",deletedBy:""},
  },
  {
  $inc:{__v:1}
  })
  
  user.matchedCount?res.status(200).json({message:"success",user:req.existingUser}):res.status(400).json({message:"user does not exist or already restored"});     
}


export const testUpload = async(req,res,next)=>{

  

 const data = await cloudinary.uploader.upload(req?.file?.path,{
  folder:"sarahaApp",
  use_filename:true,
  unique_filename:false,
  resource_type:"auto"
 })
  // res.status(200).json({message:"Success",file:req.file});
  res.status(200).json({message:"Success",data});

}

export const updateProfileImage = async(req,res,next)=>{
// upload el gdeeda
  const {secure_url,public_id} = await cloudinary.uploader.upload(req?.file?.path,{
  folder:"sarahaApp/users/profileImage",
  // use_filename:true,
  // unique_filename:false,
  // resource_type:"auto"
 })

const user = await userModel.findByIdAndUpdate({_id:req?.existingUser?.id},{profileImage:{secure_url,public_id}})
// ams7 el adeema
await cloudinary.uploader.destroy(user?.profileImage?.public_id);
// await cloudinary.uploader.delete_resources([]); array of public ids
// await cloudinary.api.delete_folder("sarahaApp/users/coverImages") bs lazem yb2a fady
// =>>>> sol deleted_resources_by_prefix("folderPath") then delete_folder next 
return res.status(200).json({message:"success",user});     
}




