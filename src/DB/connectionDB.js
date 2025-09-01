import mongoose from "mongoose";
import chalk from "chalk"

const checkConnectionDB = async(req,res,next) =>{
    await mongoose.connect(process.env.DB_URL_ONLINE)
    .then(()=>{
        console.log(chalk.bgGreen("Connection to database was successfull"));
    })
    .catch((error)=>{
        console.log("Connection to database failed",error);
    })
}

export default checkConnectionDB