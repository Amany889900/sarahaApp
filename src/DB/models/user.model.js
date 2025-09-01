import mongoose from "mongoose";

export const userGender = {
    male:"male",
    female:"female"
};

export const userRole = {
    user:"user",
    admin:"admin"
}

export const userProviders = {
    system:"system",
    google:"google"
}
const userSchema = new mongoose.Schema({
name:{
    type:String,
    required:true,
    trim:true,
    minLength:2,
},
email:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true
},
password:{
   type:String,
   required:true
},
profileImage:{
    secure_url:{type:String},
    public_id:{type:String}
},
coverImages:[String],
phone:{
    type:String,
    // required:true,
    trim:true
},
gender:{
    type:String,
    enum:Object.values(userGender),
    default:userGender.male
},
age:{
    type:Number,
    // required:true,
    min:18,
    max:60
},
confirmed:{
    type:Boolean,
    default:false
},
role:{
    type:String,
    enum:Object.values(userRole),
    default:userRole.user
},
otp:String,
isDeleted: Boolean,
deletedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
},
provider:{
    type:String,
    enum:Object.values(userProviders),
    default:userProviders.system
},
isBanned:{
    type:Boolean,
    default:false
},
bannedAt:{
    type:Date,
    default:null
}
},{
    timestamps:true
})


const userModel = mongoose.models.User || mongoose.model("User",userSchema);


export default userModel