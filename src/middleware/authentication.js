import userModel from "../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import { verifyToken } from './../utils/token/verifyToken.js';
import RevokeTokenModel from "../DB/models/revoke-token.model.js";

export const authentication = async(req,res,next) =>{
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
        signature = process.env.ACCESS_TOKEN_USER;
     }else if(prefix=="admin"){
        signature=process.env.ACCESS_TOKEN_ADMIN;
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
    if(!existingUser?.confirmed || existingUser?.isDeleted){
      throw new Error("Please confirm email first or you are freezed",{cause:400});
    }
     req.existingUser=existingUser; // a pass el user ll middle ware el b3d kda 3n taree2 el request
     req.decoded_access_token=decoded_access_token;
     return next();
     
}


