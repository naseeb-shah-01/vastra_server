import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { sendEmail } from "../app/controllers/email.controller";
import { searchRequests } from "../app/controllers/query.controller";

const router = express.Router();
router.post("/",(r,s)=>sendEmail(r,s))


export default router;