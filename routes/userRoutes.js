import express, { Router } from 'express';
import { Login, Signup,Logout, getMyProfile, changePassword, updateProfile, updateProfilePicture, forgetPassword, resetPassword, AddtoPlaylist, removeFromPlaylist, deleteUser, updateUserRole, getAllUsers, deleteMyProfile } from '../controllers/userController.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';


const router=express.Router();

router.route("/signup").post(singleUpload, Signup)

router.route("/login").post(Login)

router.route("/logout").get(Logout)

router.route("/me").get(isAuthenticated, getMyProfile)

router.route("/me").delete(isAuthenticated,deleteMyProfile)


router.route("/changepassword").put(isAuthenticated,changePassword)

router.route("/updateprofile").put(isAuthenticated,updateProfile)

router.route("/updateprofilepicture").put(isAuthenticated,singleUpload, updateProfilePicture)

router.route("/forgetpassword").post(forgetPassword)

router.route("/resetpassword/:token").put(resetPassword)

router.route("/addtoplaylist").post(isAuthenticated, AddtoPlaylist)

router.route("/removefromplaylist").delete(isAuthenticated,removeFromPlaylist)

router.route("/admin/users").get(isAuthenticated,authorizeAdmin,getAllUsers);

router.route("/admin/user/:id").put(isAuthenticated,authorizeAdmin,updateUserRole);

router.route("/admin/user/:id").delete(isAuthenticated,authorizeAdmin,deleteUser)

export default router;