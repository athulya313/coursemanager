import jwt from "jsonwebtoken"
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { AsyncError } from "./AsyncError.js"


export const isAuthenticated=AsyncError(async(req,res,next)=>{
    const {token}=req.cookies;
    console.log(token); 

    if(!token)
      return next(new ErrorHandler("User not logged in",401))

      const decoded=jwt.verify(token,process.env.Jwt_SECRET)

      req.user=await User.findById(decoded._id)
    

      next();
})

export const authorizeAdmin=(req,res,next)=>{
  if(req.user.role!=="admin")
       return next(new ErrorHandler(`${req.user.role} is not allowed to access this resources`))
       next()
}

export const authorizeSubscribers=(req,res,next)=>{
  if(req.user.subscription.status!=="active" && req.user.role!=="admin")
  return next(new ErrorHandler(`Only subscribers are allowed to access this resource`,403));
  next()
  
  
}