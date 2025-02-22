import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import passport from "passport";
// import session from "express-session";
import connectDB from "../src/config/database";
import authRoutes from "../src/routes/auth.routes";
import emailRoutes from "../src/routes/email.routes";
import queryRoutes  from "../src/routes/req.routes"
import { authenticate } from "./middleware/auth.middleware";

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
// app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/email", emailRoutes);
app.use("/request", queryRoutes);
app.get("/",(req,res)=>{
    res.status(200).json({message:"Server is runing"})
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
