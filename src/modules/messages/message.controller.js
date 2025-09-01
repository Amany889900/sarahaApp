import {Router} from "express"
import * as MS from "./message.service.js"
import * as MV from "./message.validation.js"
import { validation } from "../../middleware/validation.js"
import { authentication } from "../../middleware/authentication.js"

// strict => 3shan mnzwdsh /
// mergeParams => /users/idUser/messages (zy category/subCategory) hat el messages bt3t el user dah
// bt5leeny a2dr ashoof el haga el mb3oota fl params bt3t el user zy el id kda 
const messageRouter = Router({caseSensitive:true,strict:true,mergeParams:true})


messageRouter.post("/send",validation(MV.createMessageSchema),MS.createMessage)
// messageRouter.get("/",authentication,MS.listMessages)
messageRouter.get("/",MS.listMessages)
messageRouter.get("/:id",validation(MV.getMessageSchema),authentication,MS.getMessage)

export default messageRouter