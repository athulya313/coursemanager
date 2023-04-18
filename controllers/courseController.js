import { AsyncError } from "../middlewares/AsyncError.js";
import { Course } from "../models/Course.js"
import { Stats } from "../models/Stats.js";
import { User } from "../models/User.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary"

export const getAllCourses=AsyncError(async (req,res,next)=>{
  const keyword=req.query.keyword || "";
  const category=req.query.category || "";
    const courses=await Course.find({
      title:{
        $regex:keyword,
        $options:"i"
      },
      category:{
        $regex:keyword,
        $options:"i"
      }
    }).select("-lectures");
    res.status(200).json({
        success:true,
        courses

    })

}
)

export const createCourse=AsyncError(async(req,res,next)=>{
    const { title, description, createdBy, category }=req.body;

    if(!title || !description || !category || !createdBy) {
    return next(new ErrorHandler("please provide all fields",400))
    }
   const file=req.file;
  
   const fileUri= getDataUri(file)

   const mycloud=await cloudinary.v2.uploader.upload(fileUri.content)
 

    await Course.create({title,
    description,
category,
createdBy,
poster:{
    public_id:mycloud.public_id,
    url:mycloud.secure_url 
}})
res.status(201).json({
    success:true,
    message:"course created successfully.now you can add lectures"
})
})

export const getCourseLecture=AsyncError(async(req,res,next)=>{
     const course=await Course.findById(req.params.id)
     
     if(!course)
         return next(new ErrorHandler("course not found",404))
    course.views+=1
  await course.save()

  res.status(200).json({
    success:true,
    lectures:course.lectures
  })
})

export const addLecture=AsyncError(async(req,res,next)=>{
    const{title,description}=req.body;
   const course=await Course.findById(req.params.id)

if(!course)
    return next(new ErrorHandler("Course not found",404))

    const file=req.file;
    const fileUri=getDataUri(file)

    const mycloud=await cloudinary.v2.uploader.upload(fileUri.content,{
      resource_type:"video"
    })
    
    course.lectures.push({
      title:title,
      description:description,
      video:{
        public_id:mycloud.public_id,
        url:mycloud.secure_url
      }

    })
course.numOfVideos=course.lectures.length;

await course.save()
res.status(200).json({success:true,
message:"lecture added successfully"})    

})

export const deleteCourse=AsyncError(async(req,res,next)=>{
  const id=req.params.id;

  const course=await Course.findById(id);
  if(!course)
       return next(new ErrorHandler("course not found",404))

       await cloudinary.v2.uploader.destroy(course.poster.public_id);

       for(let i=0;i<course.lectures.length;i++){
          const singlelecture=course.lectures[i]

          await cloudinary.v2.uploader.destroy(singlelecture.video.public_id,{
            resource_type:"video"
          })
          
       }
          await course.deleteOne()
          res.status(200).json({
            success:true,
            message:"Course Deleted Successfully "
          })
       
})

export const deleteLecture=AsyncError(async(req,res,next)=>{
     const{courseId,lectureId}=req.query;

     const course=await Course.findById(courseId)

     if(!course)
        return next(new ErrorHandler("Course not found",404))

const lecture=course.lectures.find((item)=>{
  if(item._id.toString()===lectureId.toString() )
  return item
})
await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
  resource_type:"video"
})
  course.lectures=course.lectures.filter((item)=>{
   if(item._id.toString()!==lectureId.toString()) return item;
});
 course.numOfVideos=course.lectures.length

 await course.save();

 res.status(200).json({
  success:true,
  message:"Lecture Deleted Successfully"
 })
})

Course.watch().on("change",async()=>{
  const stats=await Stats.find({}).sort({createdAt:"desc"}).limit(1);
  const courses=await Course.find({})
 let totalViews=0;
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    totalViews+=course.views;
    
  }
    stats[0].views=totalViews;
    stats[0].createdAt=new Date(Date.now());
    await stats[0].save();
})