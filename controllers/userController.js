import { AsyncError } from "../middlewares/AsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import {User} from '../models/User.js'
import { sendToken } from "../utils/sendToken.js";

import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { Course } from "../models/Course.js";
import mongoose from "mongoose";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary"
import { Stats } from "../models/Stats.js";




export const Signup=AsyncError(async(req,res,next)=>{


    const{name,email,password}=req.body;

    if(!name || !password ||!email) {
        return next (new ErrorHandler("please add all fields",400) )
    }

    const file=req.file

    let user=await User.findOne({email});

    if(user)
    
       return next(new ErrorHandler("User already exists",409))
    

       
       const fileUri= getDataUri(file)

   const mycloud=await cloudinary.v2.uploader.upload(fileUri.content)

      
       user=await User.create({
        name,email,password,avatar:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url
        }
       })
       sendToken(res,user,"Registered successfully",201)
});



export const Login=AsyncError(async(req,res,next)=>{
    
    const {email,password}=req.body;
 


  if(!email || !password){
    return next(new ErrorHandler("please enter all fields",400))
  }

  const user=await User.findOne({ email }).select("+password")

  if(!user){
    return next(new ErrorHandler("User doesnt exist",401))
}
const isMatch=await user.comparePassword(password)

if(!isMatch) { 
      return next(new ErrorHandler("incorrect username or password",401))
}
   sendToken(res,user,`welcome back,${user.name}`,200)

})

export const Logout=AsyncError(async(req,res,next)=>{
  res.status(200).cookie("token",null,{
    expires:new Date(Date.now()),
    httpOnly:true,
    secure:true,
    sameSite:"none"
  }).json({message:"Logged Out Successfully",
success:true})
})




export const getMyProfile=AsyncError(async(req,res,next)=>{
const user=await User.findById(req.user._id)

res.status(200).json({
  success:true,
  user
})
})

export const changePassword=AsyncError(async(req,res,next)=>{
 
  const{ oldpassword,newpassword }=req.body;
  if(!oldpassword || !newpassword)
    return next(new ErrorHandler("please enter all fields",400))

    const user=await User.findById(req.user._id).select("+password")

    const isMatch=await user.comparePassword(oldpassword)
    if(!isMatch){
       return next(new ErrorHandler("Incorrect old password",400))
    }
       user.password=newpassword;
       await user.save()

       res.status(200).json({
        success:true,
        message:"Password changed successfully"
       })
    
    

})

export const updateProfile=AsyncError(async(req,res,next)=>{
  const{name,email}=req.body;

  const user=await User.findById(req.user._id)

    if(name)
       user.name=name;
       if(email)
       user.email=email;

       await user.save()

       res.status(200).json({
        success:true,
        message:"profile updated successfully"
       })

})

export const updateProfilePicture=AsyncError(async(req,res,next)=>{
const file=req.file;
const fileUri=getDataUri(file)
const user=await User.findById(req.user._id)

const mycloud=await cloudinary.v2.uploader.upload(fileUri.content)

await cloudinary.v2.uploader.destroy(user.avatar.public_id)
  user.avatar={
    public_id:mycloud.public_id,
    url:mycloud.secure_url
  }
  await user.save()

  res.status(200).json({
    success:true,
    message:"profile picture updated successfully"
  })
})

export const forgetPassword=AsyncError(async(req,res,next)=>{

  const{email}=req.body;
  const user=await User.findOne({email});
  if(!user)
      return next(new ErrorHandler("user not found",400))

      const resetToken=await user.getResetToken();

      await user.save();

      const url=`${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

      const message=`Click on the link to reset your password.${url}.if you have not requested then please ignore it`

      sendEmail(user.email,"CourseManager Reset password",message)

      res.status(200).json({
        success:true,
        message:`Reset Token has sent to ${user.email}`
      })

})

export const resetPassword=AsyncError(async(req,res,next)=>{
  const {token}=req.params;

  const resetPasswordToken=crypto.createHash("sha256").update(token).digest("hex")

  const user=await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{
      $gt:Date.now()
    }
  })
  if(!user){
    return next(new ErrorHandler("invalid token or token has been expired",401))
  }

    user.password=req.body.password;

    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save()
1

  res.status(200).json({
    success:true,
    message:"password changed successfully",
    token
  })
})

export const AddtoPlaylist=AsyncError(async(req,res,next)=>{
  
  const user=await User.findById(req.user._id)
  const course=await Course.findById(req.body.id) 

  if(!course)
      return next(new ErrorHandler("invalid course id",404))
const itemExist=user.playlist.find((item)=>{
  if(item.course.toString()===course._id.toString()) return true
  
})
     
if(itemExist)
  return next(new ErrorHandler("Item already exists",409))
      
      user.playlist.push({
        course:course._id,
        poster:course.poster.url
      })

      await user.save();
      res.status(200).json({
        success:true,
        message:"item added to playlist"
      })

  

}
)
        
  export const removeFromPlaylist=AsyncError(async(req,res,next)=>{
   
    const user=await User.findById(req.user._id);
    const course=await Course.findById(req.body.id)
   
 if(!course)
        return next(new ErrorHandler("Invalid course id"))
        


        await user.playlist.remove({course:req.body.id});
     await user.save()
     res.status(200).json({
      success:true,
      message:"item removed from playlist"
     })
  })

  export const getAllUsers=AsyncError(async(req,res,next)=>{
    const users=await User.find({})
 
    res.status(200).json({
     success:true,
     users
    })
 })
 
 export const updateUserRole=AsyncError(async(req,res,next)=>{
   const user=await User.findById(req.params.id);
   if(!user)
     return next(new ErrorHandler("user not found",404))
 
     if(user.role==="user")  user.role="admin"
     else
 
     user.role="user";
     await user.save();
     res.status(200).json({
       success:true,
       message:"Role Updated Successfully"
     })
                    
 })
 
 export const deleteUser=AsyncError(async(req,res,next)=>{
   const user=await User.findById(req.params.id)
   if(!user)
      return next(new ErrorHandler("User Not Found"))
 
      await cloudinary.v2.uploader.destroy(user.avatar.public_id)
 
      await user.deleteOne()
 
      res.status(200).json({
       success:true,
       message:"User deleted successfully"
      })
 })


 export const deleteMyProfile=AsyncError(async(req,res,next)=>{
    const user=await User.findById(req.user._id)

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    await user.deleteOne()
    res.status(200).cookie("token",null,{
      expires:new Date(Date.now())
    }).json({
      success:true,
      message:"Profile deleted"
    })
 })

 
 
 User.watch().on("change", async () =>{
  const stats=await Stats.find({}).sort({createdAt:"desc"}).limit(1);
  
  const subscription=await User.find({"subscription.status":"active"});
  stats[0].users=await User.countDocuments();
  
  stats[0].subscription=subscription.length;
  stats[0].createdAt=new Date(Date.now());
 
  await stats[0].save();

  }
  );
  













  



















 