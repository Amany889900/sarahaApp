import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/user.model.js";


export const createMessage = async (req,res,next)=>{
  const {userId,content} = req.body;

  // check user existence & non-freeze

  const existingUser = await userModel.findOne({_id:userId,isDeleted:{$exists:false}})

  if(!existingUser){
    throw new Error("user does not exist or his account is freezed");
  }


  const message= await messageModel.create({userId,content});

  return res.status(201).json({message:"Created successfully",message})
}

export const listMessages = async (req,res,next)=>{

//lw m3dyah 3la el authentication
//   const messages = await messageModel.find({userId:req?.existingUser?._id}).populate([
//     { 
//         path:"userId",
//         select:"name"
//     }
//   ]);

// lw gaylna el id fl params
 const messages = await messageModel.find({userId:req?.params?.id}).populate([
    {
        path:"userId",
        select:"name"
    }
  ]);

  return res.status(200).json({message:"success",messages});
}

export const getMessage = async (req,res,next)=>{
  
  const {id} = req.params;
  const message = await messageModel.findOne({userId:req?.existingUser?._id,_id:id});

  if(!message){
    throw new Error("Message not found");
  }

  return res.status(200).json({message:"success",message});
}