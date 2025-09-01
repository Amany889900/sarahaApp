import {Router} from "express"
import * as US from "./user.service.js";
import { authentication } from "../../middleware/authentication.js";
import { validation } from "../../middleware/validation.js";
import * as UV from "./user.validation.js";
import { authorization } from './../../middleware/authorization.js';
import { userRole } from "../../DB/models/user.model.js";
import { allowedExtentions, MulterHost, MulterLocal } from "../../middleware/Multer.js";
import messageRouter from "../messages/message.controller.js";
const router = Router({caseSensitive:true,strict:true});

router.use("/:id/messages",messageRouter)

router.post("/signup",MulterHost({customExtentions:allowedExtentions.image}).single("attachment"),validation(UV.signUpSchema),US.signUp);
router.post("/signupWithVeriCode",validation(UV.signUpWithVeriCodeSchema),US.signUpWithVeriCode);
router.post("/signIn",validation(UV.signInSchema),US.signIn);
router.post("/signInWithVeriCode",validation(UV.signInSchema),US.signInWithVeriCode);
router.post("/loginWithGmail",validation(UV.signInSchema),US.loginWithGmail);
router.get("/confirmEmail/:token",US.confirmEmail); /////////////////////////
router.patch("/confirmVeriCode",US.confirmVeriCode); /////////////////////////
router.get("/profile",authentication,authorization([userRole.user]),US.getProfile);
router.get("/profile/:id",US.getProfileData);
router.post("/logout",authentication,US.logout);
router.patch("/updatePassword",validation(UV.updatePasswordSchema),authentication,US.updatePassword);
router.patch("/updateProfile",validation(UV.updateProfileSchema),authentication,US.updateProfile);
router.patch("/updateProfileImage",authentication,MulterHost({customExtentions:allowedExtentions.image}).single("attachment"),validation(UV.updateProfileImageSchema),US.updateProfileImage);
router.patch("/forgetPassword",validation(UV.forgetPasswordSchema),US.forgetPassword);
router.patch("/resetPassword",validation(UV.resetPasswordSchema),US.resetPassword);
router.post("/refreshToken",US.refreshToken);
router.delete("/freeze/{:id}",validation(UV.freezeProfileSchema),authentication,US.freezeProfile);
router.delete("/unfreeze/{:id}",validation(UV.unfreezeProfileSchema),authentication,US.unfreezeProfile);
// router.post("/testUpload",MulterLocal({customPath:"users",customExtentions:[...allowedExtentions.image,...allowedExtentions.video]}).single("image"),US.testUpload);
router.post("/testUpload",MulterHost({customExtentions:allowedExtentions.image}).single("image"),validation(UV.signUpSchema),US.testUpload);
// router.post("/testUpload",MulterLocal({customPath:"users",customExtentions:allowedExtentions.image}).array("attachments",2),US.testUpload);
// router.post("/testUpload",MulterLocal({customPath:"users",customExtentions:allowedExtentions.image}).fields([{name:"attachment", maxCount:1},{name:"attachments", maxCount:2}]),US.testUpload);



export default router;