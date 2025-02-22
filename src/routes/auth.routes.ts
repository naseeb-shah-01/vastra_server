import express from "express";


import { sendOtp, verifyOTP,createProfile, verifyOTPCreateUser, getAllUser } from "../app/controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";




const router = express.Router();
router.post("/send-otp",sendOtp)
router.post("/verify-otp",verifyOTP)
router.post("/create-user", authenticate,createProfile)
router.post("/create-user/verify-otp", authenticate,verifyOTPCreateUser)
router.get("/all-user", authenticate,getAllUser)
router.get("/change-status/:status")
export default router;
