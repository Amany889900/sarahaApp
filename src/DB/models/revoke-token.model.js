import mongoose from 'mongoose';

const RevokeTokenSchema = new mongoose.Schema({
  tokenId:{
    type:String,
    required:true,
  },
  expireAt:{
    type:String,
    required:true
  }
},{
   timestamps:true
})

const RevokeTokenModel =  mongoose.model.RevokeToken || mongoose.model("RevokeToken",RevokeTokenSchema);

export default RevokeTokenModel;