import  express  from "express";
import { Contact, courseRequest, getDashboardStats } from "../controllers/otherController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
const router=express.Router();

router.route("/contact").post(Contact);

router.route("/courserequest").post(courseRequest)

router.route("/admin/stats").get(isAuthenticated,authorizeAdmin,getDashboardStats)

export default router;