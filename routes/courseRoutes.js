import express from 'express';
import { addLecture, createCourse, deleteCourse, deleteLecture,  getAllCourses,  getCourseLecture, } from '../controllers/courseController.js';
import singleUpload from '../middlewares/multer.js';
import { authorizeAdmin, authorizeSubscribers, isAuthenticated } from '../middlewares/auth.js';



const router=express.Router();

router.route("/courses").get(getAllCourses);

router.route("/createcourse").post(isAuthenticated,authorizeAdmin,singleUpload,createCourse);

router.route("/course/:id").get(isAuthenticated,authorizeSubscribers, getCourseLecture);

router.route("/course/:id").post(isAuthenticated,authorizeAdmin, singleUpload,addLecture);

router.route("/course/:id").delete(isAuthenticated,authorizeAdmin,deleteCourse);

router.route("/lecture").delete(isAuthenticated,authorizeAdmin,deleteLecture);



export default router;