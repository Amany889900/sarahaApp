// import path from "path";
import dotenv from "dotenv";
// path:path.resolve("src/config/.env")
dotenv.config({});
import express from 'express'
const app = express();
import bootstrap from './src/app.controller.js'

const port = process.env.PORT || 5000;

bootstrap(app,express);


app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})