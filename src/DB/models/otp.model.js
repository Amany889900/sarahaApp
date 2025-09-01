
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  code:{
    type:String,
    required:true,
  },
  attempts:{
    type:Number,
    default:0,
    // max:5
  },
  expiryAt:{
    type:Date,
    required:true
  },
  isUsed:{
    type:Boolean,
    default:false
  }
},{
   timestamps:true
})

const otpModel =  mongoose.model.otp || mongoose.model("otp",otpSchema);

export default otpModel;