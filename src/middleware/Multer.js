import multer from "multer"
import fs from "fs"

//multer by3ml parsing ll data el gya mn el body f lazem yeegy awl haga abl el middlewares el tanya el btst2bl hagat mn el body

export const allowedExtentions = {
    image:["image/png","image/jpeg","image/jpg"],
    video:["video/mp4"]
}
export const MulterLocal = ({customPath="generals",customExtentions=[]}={})=>{ // hya already middleware msh lazem ta5od  req w res w next

  const fullPath = `uploads/${customPath}`;
  if(!fs.existsSync(fullPath)){
    fs.mkdirSync(fullPath,{recursive:true});
  }
  const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,fullPath)
  },
  filename: function (req, file, cb) {
    console.log(file);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null,uniqueSuffix+"-"+ file.originalname) // lw l2a nfs el esm by overwrite 3shan kda bn7ot el unique
    // lazem fl awel 3shan el soora tt3rd
}
})

function fileFilter (req, file, cb) {

    if(!customExtentions.includes(file.mimetype)){
         console.log(file.mimetype)
         console.log(customExtentions) // kan fady
         console.log(customPath) // kan fady
         cb(new Error('Invalid file!'))
    }else{
      cb(null, true)
    }

  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

  // To reject this file pass `false`, like so:
//   cb(null, false)

  // To accept the file pass `true`, like so:
  

  // You can always pass an error if something goes wrong:
 

}

const upload = multer({storage, fileFilter})
return upload
}

export const MulterHost = ({customExtentions=[]}={})=>{ // hya already middleware msh lazem ta5od  req w res w next

 
  const storage = multer.diskStorage({})

function fileFilter (req, file, cb) {

    if(!customExtentions.includes(file.mimetype)){
        //  console.log(file.mimetype)
        //  console.log(customExtentions) // kan fady
        //  console.log(customPath) // kan fady
         cb(new Error('Invalid file!'))
    }else{
      cb(null, true)
    }

  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

  // To reject this file pass `false`, like so:
//   cb(null, false)

  // To accept the file pass `true`, like so:
  

  // You can always pass an error if something goes wrong:
 

}

const upload = multer({storage, fileFilter})
return upload
}